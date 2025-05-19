import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFiles } from '@/hooks/useFiles';
import { useConnections } from '@/hooks/useConnections';
import { ArrowLeft, X, Upload, Clock, Calendar, CheckCircle } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import * as ImagePicker from 'expo-image-picker';

export default function ShareFileScreen() {
  const router = useRouter();
  const { shareFiles } = useFiles();
  const { connections } = useConnections();
  
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [expiry, setExpiry] = useState<string>('24h');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request permissions (for iOS)
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to select files!');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        // Add the selected assets to the list
        const newFiles = result.assets.map(asset => ({
          id: Math.random().toString(),
          uri: asset.uri,
          name: asset.uri.split('/').pop() || 'file',
          type: asset.type || 'image',
          size: asset.fileSize || 0,
        }));
        
        setSelectedFiles([...selectedFiles, ...newFiles]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select files. Please try again.');
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter(file => file.id !== id));
  };

  const toggleContact = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleShare = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Please select at least one file to share.');
      return;
    }

    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one contact to share with.');
      return;
    }

    setLoading(true);
    try {
      await shareFiles({
        files: selectedFiles,
        recipients: selectedContacts,
        expiry,
      });
      
      Alert.alert(
        'Files Shared',
        'Your files have been shared successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error sharing files:', error);
      Alert.alert('Error', 'Failed to share files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Files</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Files</Text>
          <TouchableOpacity style={styles.filePickerButton} onPress={pickImage}>
            <Upload size={24} color="#3B82F6" />
            <Text style={styles.filePickerText}>Select Files</Text>
          </TouchableOpacity>

          {selectedFiles.length > 0 && (
            <View style={styles.selectedFilesContainer}>
              {selectedFiles.map(file => (
                <View key={file.id} style={styles.selectedFile}>
                  {file.type?.startsWith('image') ? (
                    <Image source={{ uri: file.uri }} style={styles.fileImage} />
                  ) : (
                    <View style={[styles.fileImage, styles.fileIcon]}>
                      <Text style={styles.fileIconText}>
                        {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={styles.fileSize}>
                      {(file.size / 1024).toFixed(1)} KB
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFile(file.id)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share With</Text>
          {connections.length === 0 ? (
            <View style={styles.noContactsContainer}>
              <Text style={styles.noContactsText}>
                You don't have any contacts yet. Add contacts to share files.
              </Text>
            </View>
          ) : (
            <View style={styles.contactsList}>
              {connections.map(contact => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    selectedContacts.includes(contact.id) && styles.selectedContactItem,
                  ]}
                  onPress={() => toggleContact(contact.id)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.username}</Text>
                  </View>
                  {selectedContacts.includes(contact.id) && (
                    <CheckCircle size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expiration</Text>
          <View style={styles.expiryOptions}>
            <TouchableOpacity
              style={[styles.expiryOption, expiry === '24h' && styles.selectedExpiryOption]}
              onPress={() => setExpiry('24h')}
            >
              <Clock size={20} color={expiry === '24h' ? '#3B82F6' : '#6B7280'} />
              <Text
                style={[
                  styles.expiryText,
                  expiry === '24h' && styles.selectedExpiryText,
                ]}
              >
                24 Hours
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.expiryOption, expiry === '7d' && styles.selectedExpiryOption]}
              onPress={() => setExpiry('7d')}
            >
              <Calendar size={20} color={expiry === '7d' ? '#3B82F6' : '#6B7280'} />
              <Text
                style={[
                  styles.expiryText,
                  expiry === '7d' && styles.selectedExpiryText,
                ]}
              >
                7 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.expiryOption, expiry === 'never' && styles.selectedExpiryOption]}
              onPress={() => setExpiry('never')}
            >
              <CheckCircle size={20} color={expiry === 'never' ? '#3B82F6' : '#6B7280'} />
              <Text
                style={[
                  styles.expiryText,
                  expiry === 'never' && styles.selectedExpiryText,
                ]}
              >
                Never
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Share Files"
          onPress={handleShare}
          disabled={selectedFiles.length === 0 || selectedContacts.length === 0}
          isLoading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  backButton: {
    padding: 8,
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
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF5FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  filePickerText: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  selectedFilesContainer: {
    marginTop: 16,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileImage: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  fileIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    fontFamily: 'Inter-Bold',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  removeButton: {
    padding: 8,
  },
  noContactsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  noContactsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  contactsList: {
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#F9FAFB',
  },
  selectedContactItem: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EBF5FF',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
  },
  expiryOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#F9FAFB',
  },
  selectedExpiryOption: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EBF5FF',
  },
  expiryText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
  },
  selectedExpiryText: {
    color: '#3B82F6',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});