import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Download, FileText, Clock, Trash2, Share, XCircle } from 'lucide-react-native';
import { useFiles } from '@/hooks/useFiles';
import Button from '@/components/ui/Button';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function FileDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getFileById, downloadFile, deleteFile } = useFiles();
  
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadFile = async () => {
      try {
        if (typeof id !== 'string') return;
        const fileData = await getFileById(id);
        setFile(fileData);
      } catch (error) {
        console.error('Error loading file details:', error);
        Alert.alert('Error', 'Failed to load file details.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFile();
  }, [id]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      if (typeof id !== 'string') return;
      
      // For demo purposes, simulate download
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setDownloadProgress(i);
      }
      
      if (Platform.OS === 'web') {
        Alert.alert('Download Complete', 'File has been downloaded successfully.');
      } else {
        // On native, use share functionality
        const shareOptions = {
          title: file.name,
          message: `Check out this file: ${file.name}`,
          url: file.uri,
        };
        
        // Check if sharing is available (iOS & Android)
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(file.uri);
        } else {
          Alert.alert('Sharing Unavailable', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (typeof id !== 'string') return;
              await deleteFile(id);
              router.back();
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete file. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading file details...</Text>
      </SafeAreaView>
    );
  }

  if (!file) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <XCircle size={48} color="#EF4444" />
        <Text style={styles.errorText}>File not found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>File Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filePreviewContainer}>
          {file.type?.startsWith('image') ? (
            <Image source={{ uri: file.uri }} style={styles.filePreview} resizeMode="contain" />
          ) : (
            <View style={[styles.filePreview, styles.fileIconContainer]}>
              <FileText size={64} color="#6B7280" />
              <Text style={styles.fileExtension}>
                {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.fileInfoContainer}>
          <Text style={styles.fileName}>{file.name}</Text>
          
          <View style={styles.fileMetadata}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Size</Text>
              <Text style={styles.metadataValue}>{formatFileSize(file.size || 0)}</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Type</Text>
              <Text style={styles.metadataValue}>
                {file.type?.split('/')[1]?.toUpperCase() || 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Shared</Text>
              <Text style={styles.metadataValue}>
                {new Date(file.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.expiryContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.expiryText}>
              {file.expiry === 'never' 
                ? 'Never expires' 
                : `Expires ${file.expiry === '24h' ? 'in 24 hours' : 'in 7 days'}`}
            </Text>
          </View>

          <View style={styles.sharedInfoContainer}>
            <Text style={styles.sharedInfoLabel}>
              {file.isReceived ? 'Shared by' : 'Shared with'}
            </Text>
            <View style={styles.sharedWithList}>
              {(file.contacts || []).map((contact: any) => (
                <View key={contact.id} style={styles.contactBadge}>
                  <Text style={styles.contactBadgeText}>{contact.username}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {isDownloading ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${downloadProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{downloadProgress}%</Text>
            </View>
          ) : (
            <Button
              title={file.isReceived ? "Download" : "Share Again"}
              icon={file.isReceived ? <Download size={20} color="#FFFFFF" /> : <Share size={20} color="#FFFFFF" />}
              onPress={handleDownload}
              style={styles.downloadButton}
            />
          )}
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: 'Inter-Bold',
  },
  backButton: {
    width: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
  },
  filePreviewContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  fileIconContainer: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileExtension: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 8,
    fontFamily: 'Inter-Bold',
  },
  fileInfoContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  fileMetadata: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter-Regular',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  expiryText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  sharedInfoContainer: {
    marginTop: 8,
  },
  sharedInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  sharedWithList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contactBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  contactBadgeText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
  },
  actionsContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  downloadButton: {
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    fontFamily: 'Inter-Medium',
  },
});