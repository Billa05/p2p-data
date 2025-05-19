import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  RefreshControl,
  Platform
} from 'react-native';
import { useFiles } from '@/hooks/useFiles';
import { FileText, Download, Upload, Filter } from 'lucide-react-native';
import FileCard from '@/components/file/FileCard';
import { useRouter } from 'expo-router';
import EmptyState from '@/components/ui/EmptyState';

type FilterType = 'all' | 'received' | 'sent';

export default function FilesScreen() {
  const { files, refreshFiles } = useFiles();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const router = useRouter();
  
  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'received') return file.isReceived;
    if (filter === 'sent') return !file.isReceived;
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshFiles();
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = () => {
    router.push('/(modals)/share-file');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Files</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => {
            // Cycle through filters
            if (filter === 'all') setFilter('received');
            else if (filter === 'received') setFilter('sent');
            else setFilter('all');
          }}
        >
          <Filter size={20} color="#4B5563" />
          <Text style={styles.filterText}>
            {filter === 'all' ? 'All' : filter === 'received' ? 'Received' : 'Sent'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.receivedCard]}>
          <View style={styles.statIconContainer}>
            <Download size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>
            {files.filter(f => f.isReceived).length}
          </Text>
          <Text style={styles.statLabel}>Received</Text>
        </View>

        <View style={[styles.statCard, styles.sentCard]}>
          <View style={styles.statIconContainer}>
            <Upload size={20} color="#0D9488" />
          </View>
          <Text style={styles.statValue}>
            {files.filter(f => !f.isReceived).length}
          </Text>
          <Text style={styles.statLabel}>Sent</Text>
        </View>
      </View>

      {filteredFiles.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} color="#D1D5DB" />}
          title="No files yet"
          description={
            filter === 'all' 
              ? "Share or receive files to see them here" 
              : filter === 'received' 
                ? "You haven't received any files yet" 
                : "You haven't shared any files yet"
          }
          actionLabel="Share Files"
          onAction={handleShare}
        />
      ) : (
        <FlatList
          data={filteredFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FileCard
              file={item}
              onPress={() => router.push({
                pathname: '/(modals)/file-detail',
                params: { id: item.id }
              })}
            />
          )}
          contentContainerStyle={styles.filesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  receivedCard: {
    backgroundColor: '#EBF5FF',
  },
  sentCard: {
    backgroundColor: '#ECFDF5',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Inter-Medium',
  },
  filesList: {
    padding: 16,
  },
});