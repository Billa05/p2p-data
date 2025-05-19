import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FileText, Image as ImageIcon, Download, Upload } from 'lucide-react-native';

interface FileCardProps {
  file: {
    id: string;
    name: string;
    type?: string;
    size?: number;
    uri?: string;
    createdAt?: number | Date;
    isReceived?: boolean;
    sender?: {
      username: string;
    };
    recipient?: {
      username: string;
    };
  };
  onPress?: () => void;
}

export default function FileCard({ file, onPress }: FileCardProps) {
  const {
    name,
    type,
    size,
    uri,
    createdAt,
    isReceived,
    sender,
    recipient
  } = file;
  
  const isImage = type?.startsWith('image/');
  const fileExtension = name.split('.').pop()?.toUpperCase();
  
  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Format date
  const formatDate = (date?: number | Date) => {
    if (!date) return 'Unknown date';
    const d = typeof date === 'number' ? new Date(date) : date;
    return d.toLocaleDateString();
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        {isImage && uri ? (
          <Image source={{ uri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.fileIconContainer}>
            <FileText size={24} color="#6B7280" />
            <Text style={styles.fileExtension}>{fileExtension || 'FILE'}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.fileName} numberOfLines={1}>{name}</Text>
        <Text style={styles.fileInfo}>
          {formatFileSize(size)} • {formatDate(createdAt)}
        </Text>
        
        <View style={styles.transferInfo}>
          {isReceived ? (
            <View style={styles.transferBadgeReceived}>
              <Download size={12} color="#3B82F6" />
              <Text style={styles.transferTextReceived}>
                From {sender?.username || 'Unknown'}
              </Text>
            </View>
          ) : (
            <View style={styles.transferBadgeSent}>
              <Upload size={12} color="#0D9488" />
              <Text style={styles.transferTextSent}>
                To {recipient?.username || 'Unknown'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  fileIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  fileExtension: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 4,
    fontFamily: 'Inter-Bold',
  },
  details: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  fileInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Inter-Regular',
  },
  transferInfo: {
    flexDirection: 'row',
  },
  transferBadgeReceived: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transferTextReceived: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  transferBadgeSent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transferTextSent: {
    fontSize: 12,
    color: '#0D9488',
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
});