import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import * as signaling from '@/utils/signaling';
import * as webrtc from '@/utils/webrtc';
import { generateSecureKeys, encryptMessage, decryptMessage } from '@/utils/crypto';
import * as FileSystem from 'expo-file-system';

// Define types
interface File {
  id: string;
  name: string;
  type?: string;
  size?: number;
  uri?: string;
  createdAt: number;
  expiry: string;
  isReceived: boolean;
  sender?: {
    id: string;
    username: string;
  };
  recipient?: {
    id: string;
    username: string;
  };
  contacts: any[];
}

interface ShareFileParams {
  files: any[];
  recipients: string[];
  expiry: string;
}

interface FileContextValue {
  files: File[];
  recentFiles: File[];
  shareFiles: (params: ShareFileParams) => Promise<void>;
  downloadFile: (fileId: string) => Promise<string>;
  deleteFile: (fileId: string) => Promise<void>;
  getFileById: (id: string) => Promise<File | null>;
  getFilesByContact: (contactId: string) => Promise<File[]>;
  refreshFiles: () => Promise<void>;
  acceptFileShare: (fileMeta: any) => Promise<void>;
}

// Create the context
export const FileContext = createContext<FileContextValue>({
  files: [],
  recentFiles: [],
  shareFiles: async () => {},
  downloadFile: async () => '',
  deleteFile: async () => {},
  getFileById: async () => null,
  getFilesByContact: async () => [],
  refreshFiles: async () => {},
  acceptFileShare: async (_fileMeta: any) => {},
});

import { useNotification } from './NotificationContext';
// Provider component
export function FileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  // Accept incoming file share (scaffold)
  const acceptFileShare = async (fileMeta: any) => {
    if (!user) {
      showNotification({ type: 'error', message: 'User not authenticated.' });
      return;
    }
    try {
      showNotification({
        type: 'transfer',
        message: `Connecting to sender for ${fileMeta.name}...`,
      });
      // 1. Create PeerJS instance for this user
      const { peer } = await webrtc.createPeerConnection(user.id) as any;
      // 2. Connect to sender (sender's peerId is fileMeta.sender.id)
      const conn = await webrtc.connectToPeer(peer, fileMeta.sender.id);
      let receivedChunks: Uint8Array[] = [];
      let receivedBytes = 0;
      const totalBytes = fileMeta.size || 0;
      // 3. Listen for data
      webrtc.listenForData(conn, async (data: any) => {
        if (data.done) {
          // All chunks received, assemble file
          const blob = new Blob(receivedChunks, { type: fileMeta.type || 'application/octet-stream' });
          // Save blob to storage and get URI
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result?.toString().split(',')[1];
            if (base64data) {
              const fileUri = `${FileSystem.documentDirectory}${fileMeta.name}`;
              await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
              // Update files state
              if (!user) return;
              const newFile = { ...fileMeta, uri: fileUri, isReceived: true };
              setFiles(prev => [...prev, newFile]);
              await saveToStorage(`files_${user.id}`, JSON.stringify([...files, newFile]));
              showNotification({
                type: 'success',
                message: `File received: ${fileMeta.name}`,
              });
            }
          };
          reader.readAsDataURL(blob);
        } else if (data.chunk) {
          receivedChunks.push(new Uint8Array(data.chunk));
          receivedBytes += data.chunk.byteLength;
          showNotification({
            type: 'transfer',
            message: `Receiving ${fileMeta.name}... ${((receivedBytes / totalBytes) * 100).toFixed(0)}%`,
          });
        }
      });
      // 4. Send ready/accept signal if needed (optional)
    } catch (err) {
      showNotification({ type: 'error', message: `Transfer failed: ${fileMeta.name}` });
    }
  };

  // Listen for incoming file share and signaling messages
  useEffect(() => {
    if (!user) return;
    let polling = true;
    async function pollSignals() {
      while (polling) {
        try {
          if (!user) break;
          const incoming = await signaling.getIncomingSignals(user.id);
          for (const sig of incoming) {
            if (sig.type === 'file-metadata') {
              // Add file metadata to local state for user to accept/decline
              setFiles(prev => [...prev, { ...sig.data, isReceived: true }]);
              showNotification({
                type: 'request',
                message: `Incoming file from ${sig.data.sender?.username || 'Unknown'}: ${sig.data.name}`,
                data: sig.data
              });
            } else if (sig.type === 'file-request') {
              showNotification({
                type: 'request',
                message: `File request from ${sig.from}`,
                data: sig.data
              });
            }
            // Handle offer, answer, ice-candidate, etc.
            // TODO: Implement full WebRTC signaling and file transfer logic
          }
        } catch (e) {}
        await new Promise(res => setTimeout(res, 2000));
      }
    }
    pollSignals();
    return () => { polling = false; };
  }, [user]);
  const [files, setFiles] = useState<File[]>([]);
  

  // Load files from storage when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [isAuthenticated, user]);

  // Storage helpers
  const getFromStorage = async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  };

  const saveToStorage = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  };

  // Load files from storage (local cache only)
  const loadFiles = async () => {
    try {
      if (!user) return;
      const filesJSON = await getFromStorage(`files_${user.id}`);
      if (filesJSON) {
        setFiles(JSON.parse(filesJSON));
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  // Share files with contacts using signaling and WebRTC
  const shareFiles = async (params: ShareFileParams) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const { files: newFiles, recipients, expiry } = params;
      const now = Date.now();
      for (const file of newFiles) {
        // For each recipient, send metadata and initiate WebRTC
        for (const recipientId of recipients) {
          // 1. Prepare metadata
          const metadata = {
            id: uuidv4(),
            name: file.name,
            type: file.type,
            size: file.size,
            createdAt: now,
            expiry,
            sender: { id: user.id, username: user.username },
            recipient: { id: recipientId, username: '' }, // Username can be fetched from contacts
          };
          // 2. Sign metadata (TODO: implement real signature)
          // 3. Send metadata to recipient via signaling server
          await signaling.sendSignal({
            type: 'file-metadata',
            from: user.id,
            to: recipientId,
            data: metadata,
          });
          // 4. Wait for recipient to accept and initiate WebRTC transfer
          // (This would be handled by a UI/notification and a listener for incoming signals)
        }
      }
    } catch (error) {
      console.error('Error sharing files:', error);
      throw error;
    }
  };

  // Download a file (initiate WebRTC if not local)
  const downloadFile = async (fileId: string): Promise<string> => {
    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');
      // If file is not local, initiate signaling and WebRTC to fetch
      if (!file.uri) {
        // 1. Send request for file via signaling
        await signaling.sendSignal({
          type: 'file-request',
          from: user!.id,
          to: file.sender?.id || '',
          data: { fileId },
        });
        // 2. Wait for WebRTC connection and file transfer (handled by a listener)
        // 3. Save received file locally and update state
        // For now, throw to indicate not implemented
        throw new Error('WebRTC file transfer not yet implemented in UI');
      }
      return file.uri;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  };

  // Delete a file (local only)
  const deleteFile = async (fileId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      await saveToStorage(`files_${user.id}`, JSON.stringify(updatedFiles));
      // TODO: Optionally notify recipients via signaling
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  // Get file by ID
  const getFileById = async (id: string): Promise<File | null> => {
    const file = files.find(f => f.id === id);
    return file || null;
  };

  // Get files shared with a specific contact
  const getFilesByContact = async (contactId: string): Promise<File[]> => {
    // Return files where this contact is either the sender or recipient
    return files.filter(file => 
      (file.sender?.id === contactId) || 
      (file.recipient?.id === contactId) ||
      file.contacts.some(contact => contact.id === contactId)
    );
  };

  // Refresh files data
  const refreshFiles = async () => {
    if (user) {
      await loadFiles();
    }
  };

  // Compute recentFiles as the 3 most recent by createdAt
  const recentFiles = [...files]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3); // This is the only declaration; remove any others above.

  return (
    <FileContext.Provider value={{
      files,
      recentFiles,
      shareFiles,
      downloadFile,
      deleteFile,
      getFileById,
      getFilesByContact,
      refreshFiles,
      acceptFileShare,
    }}>
      {children}
    </FileContext.Provider>
  );
}