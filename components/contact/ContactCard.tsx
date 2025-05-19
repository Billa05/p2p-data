import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ContactCardProps {
  contact: {
    id: string;
    username: string;
    avatarUrl?: string;
    lastActivity?: Date;
    isOnline?: boolean;
  };
  onPress?: () => void;
}

export default function ContactCard({ contact, onPress }: ContactCardProps) {
  const { username, avatarUrl, lastActivity, isOnline } = contact;
  
  // Generate a color based on the username for contacts without avatars
  const generateColor = (name: string) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#8B5CF6', // purple
      '#EC4899', // pink
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const backgroundColor = generateColor(username);
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor }]}>
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.details}>
        <Text style={styles.name}>{username}</Text>
        <Text style={styles.lastActivity}>
          {lastActivity 
            ? `Last active ${formatTimeAgo(lastActivity)}` 
            : 'Recently added'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Helper function to format time ago
function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  details: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  lastActivity: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
});