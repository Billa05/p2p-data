import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as signaling from '@/utils/signaling';

// Define types
interface Connection {
  id: string;
  username: string;
  publicKey: string;
  avatarUrl?: string;
  connectedAt: number;
  isOnline?: boolean;
}

interface ConnectionRequest {
  id: string;
  username: string;
  publicKey: string;
  timestamp: number;
}

interface ConnectionContextValue {
  connections: Connection[];
  pendingRequests: ConnectionRequest[];
  searchUsers: (query: string) => Promise<any[]>;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptConnectionRequest: (requestId: string) => Promise<void>;
  rejectConnectionRequest: (requestId: string) => Promise<void>;
  removeConnection: (connectionId: string) => Promise<void>;
  getContactById: (id: string) => Promise<Connection | null>;
  refreshConnections: () => Promise<void>;
}

// Create the context
export const ConnectionContext = createContext<ConnectionContextValue>({
  connections: [],
  pendingRequests: [],
  searchUsers: async () => [],
  sendConnectionRequest: async () => {},
  acceptConnectionRequest: async () => {},
  rejectConnectionRequest: async () => {},
  removeConnection: async () => {},
  getContactById: async () => null,
  refreshConnections: async () => {},
});

// Provider component
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);

  // Load connections and requests from storage when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConnections();
      loadPendingRequests();
    } else {
      setConnections([]);
      setPendingRequests([]);
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

  const removeFromStorage = async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  };

  // Load connections from server
  const loadConnections = async () => {
    try {
      if (!user) return;
      // TODO: Replace with actual API call to fetch connections from signaling server
      // Example:
      // const connections = await getConnections(user.id);
      // setConnections(connections);
      // For now, just clear connections for production
      setConnections([]);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  // Load pending requests from signaling server
  const loadPendingRequests = async () => {
    try {
      if (!user) return;
      // Use signaling API
      const { getIncomingRequests } = await import('@/utils/signaling');
      const requests = await getIncomingRequests(user.id);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  // Search for users using signaling server
  const searchUsers = async (query: string): Promise<any[]> => {
    try {
      const { searchUsers } = await import('@/utils/signaling');
      const results = await searchUsers(query);
      // Filter out current user and already connected users
      return results.filter((u: any) =>
        u.id !== user?.id &&
        !connections.some(c => c.id === u.id) &&
        !pendingRequests.some(r => r.id === u.id)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  // Send connection request via signaling server
  const sendConnectionRequest = async (recipientId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const { sendConnectionRequest } = await import('@/utils/signaling');
      // Find recipient profile (from search or API)
      const recipientProfile = { id: recipientId, username: '', publicKey: '' }; // TODO: fetch full profile if needed
      await sendConnectionRequest({
        from: { id: user.id, username: user.username, publicKey: user.publicKey },
        to: recipientProfile,
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  };

  // Accept connection request
  const acceptConnectionRequest = async (requestId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Find the request
      const request = pendingRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');
      
      // Create new connection
      const newConnection: Connection = {
        id: request.id,
        username: request.username,
        publicKey: request.publicKey,
        connectedAt: Date.now(),
      };
      
      // Update state and storage
      const updatedConnections = [...connections, newConnection];
      const updatedRequests = pendingRequests.filter(r => r.id !== requestId);
      
      setConnections(updatedConnections);
      setPendingRequests(updatedRequests);
      
      await saveToStorage(`connections_${user.id}`, JSON.stringify(updatedConnections));
      await saveToStorage(`requests_${user.id}`, JSON.stringify(updatedRequests));
      
      // In a real app, send acceptance to the server
    } catch (error) {
      console.error('Error accepting connection request:', error);
      throw error;
    }
  };

  // Reject connection request
  const rejectConnectionRequest = async (requestId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Update state and storage
      const updatedRequests = pendingRequests.filter(r => r.id !== requestId);
      setPendingRequests(updatedRequests);
      await saveToStorage(`requests_${user.id}`, JSON.stringify(updatedRequests));
      
      // In a real app, send rejection to the server
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      throw error;
    }
  };

  // Remove connection
  const removeConnection = async (connectionId: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Update state and storage
      const updatedConnections = connections.filter(c => c.id !== connectionId);
      setConnections(updatedConnections);
      await saveToStorage(`connections_${user.id}`, JSON.stringify(updatedConnections));
      
      // In a real app, send removal to the server
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  };

  // Get contact by ID
  const getContactById = async (id: string): Promise<Connection | null> => {
    const contact = connections.find(c => c.id === id);
    return contact || null;
  };

  // Refresh connections data
  const refreshConnections = async () => {
    if (user) {
      await loadConnections();
      await loadPendingRequests();
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        pendingRequests,
        searchUsers,
        sendConnectionRequest,
        acceptConnectionRequest,
        rejectConnectionRequest,
        removeConnection,
        getContactById,
        refreshConnections,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}