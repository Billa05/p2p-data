import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useFiles } from '@/hooks/useFiles';
import { useConnections } from '@/hooks/useConnections';
import { Share, Plus, FileText, ArrowRight, Clock, Upload, Download } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/ui/Button';
import ActivityCard from '@/components/activity/ActivityCard';
import { useCallback, useEffect, useState } from 'react';

export default function HomeScreen() {
  const { user } = useAuth();
  const { recentFiles } = useFiles();
  const { connections, pendingRequests } = useConnections();
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);

  const loadActivities = useCallback(() => {
    // This would typically fetch from a real activity log
    // For now, we'll create some sample activities
    const sampleActivities = [
      {
        id: '1',
        type: 'fileReceived',
        user: 'Alice',
        fileName: 'Project Proposal.pdf',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        icon: Download,
        iconColor: '#3B82F6',
      },
      {
        id: '2',
        type: 'fileSent',
        user: 'Bob',
        fileName: 'Meeting Notes.docx',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        icon: Upload,
        iconColor: '#0D9488',
      },
      {
        id: '3',
        type: 'connectionAccepted',
        user: 'Charlie',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        icon: Users,
        iconColor: '#8B5CF6',
      },
    ];
    
    setActivities(sampleActivities);
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleNewShare = () => {
    router.push('/(modals)/share-file');
  };

  const handleViewAllFiles = () => {
    router.push('/files');
  };

  const handleViewAllContacts = () => {
    router.push('/contacts');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Share Files"
            icon={<Share size={20} color="#FFFFFF" />}
            onPress={handleNewShare}
            style={styles.mainButton}
          />
        </View>

        {pendingRequests.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertIconContainer}>
              <Clock size={20} color="#F59E0B" />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Pending Requests</Text>
              <Text style={styles.alertDescription}>
                You have {pendingRequests.length} connection {pendingRequests.length === 1 ? 'request' : 'requests'} waiting
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.alertAction}
              onPress={() => router.push('/contacts')}
            >
              <ArrowRight size={20} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {activities.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <FileText size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>
              Activities will appear here when you share or receive files
            </Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Connections</Text>
          <TouchableOpacity onPress={handleViewAllContacts}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {connections.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Users size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No connections yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add contacts to start sharing files securely
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => router.push('/contacts')}
            >
              <Text style={styles.emptyStateButtonText}>Add Contacts</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={connections.slice(0, 3)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.connectionsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.connectionCard}>
                <Image
                  source={{ uri: item.avatarUrl || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' }}
                  style={styles.connectionAvatar}
                />
                <Text style={styles.connectionName}>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  actionContainer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mainButton: {
    height: 54,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    fontFamily: 'Inter-Bold',
  },
  alertDescription: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  alertAction: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
  },
  activityList: {
    marginHorizontal: 24,
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
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
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
  },
  connectionsList: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  connectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    width: 100,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  connectionAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  connectionName: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  spacer: {
    height: 100,
  },
});