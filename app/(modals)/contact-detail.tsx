import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share, FileText, Trash2, XCircle } from 'lucide-react-native';
import { useConnections } from '@/hooks/useConnections';
import { useFiles } from '@/hooks/useFiles';
import FileCard from '@/components/file/FileCard';
import Button from '@/components/ui/Button';

export default function ContactDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getContactById, removeConnection } = useConnections();
  const { getFilesByContact } = useFiles();
  
  const [contact, setContact] = useState<any>(null);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (typeof id !== 'string') return;
        const contactData = await getContactById(id);
        setContact(contactData);
        
        const files = await getFilesByContact(id);
        setSharedFiles(files);
      } catch (error) {
        console.error('Error loading contact details:', error);
        Alert.alert('Error', 'Failed to load contact details.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleShareWithContact = () => {
    router.push({
      pathname: '/(modals)/share-file',
      params: { contactId: id }
    });
  };

  const handleRemoveContact = () => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contact?.username} from your contacts?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (typeof id !== 'string') return;
              await removeConnection(id);
              router.back();
            } catch (error) {
              console.error('Error removing contact:', error);
              Alert.alert('Error', 'Failed to remove contact. Please try again.');
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
        <Text style={styles.loadingText}>Loading contact details...</Text>
      </SafeAreaView>
    );
  }

  if (!contact) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <XCircle size={48} color="#EF4444" />
        <Text style={styles.errorText}>Contact not found</Text>
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
        <Text style={styles.headerTitle}>Contact Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.contactHeader}>
          <View style={styles.contactAvatar}>
            <Text style={styles.avatarText}>
              {contact.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.contactName}>{contact.username}</Text>
          <Text style={styles.contactStatus}>Connected since {new Date(contact.connectedAt || Date.now()).toLocaleDateString()}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareWithContact}>
            <View style={[styles.actionIcon, styles.shareIcon]}>
              <Share size={20} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Share Files</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleRemoveContact}>
            <View style={[styles.actionIcon, styles.removeIcon]}>
              <Trash2 size={20} color="#EF4444" />
            </View>
            <Text style={[styles.actionText, styles.removeText]}>Remove</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shared Files</Text>
          
          {sharedFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No shared files</Text>
              <Text style={styles.emptyStateSubtext}>
                Files shared with {contact.username} will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.filesList}>
              {sharedFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  onPress={() => router.push({
                    pathname: '/(modals)/file-detail',
                    params: { id: file.id }
                  })}
                />
              ))}
            </View>
          )}
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
  contactHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  contactName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  contactStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareIcon: {
    backgroundColor: '#EBF5FF',
  },
  removeIcon: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
  },
  removeText: {
    color: '#EF4444',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 16,
    fontFamily: 'Inter-Bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  filesList: {
    marginTop: 8,
  },
});