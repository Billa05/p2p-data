import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';

interface ActivityCardProps {
  activity: {
    id: string;
    type: string;
    user: string;
    fileName?: string;
    timestamp: Date;
    icon: any; // Icon component
    iconColor: string;
  };
  onPress?: () => void;
}

export default function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const { type, user, fileName, timestamp, icon: Icon, iconColor } = activity;
  
  // Format activity message based on type
  const getActivityMessage = () => {
    switch (type) {
      case 'fileReceived':
        return `${user} shared ${fileName} with you`;
      case 'fileSent':
        return `You shared ${fileName} with ${user}`;
      case 'connectionAccepted':
        return `${user} accepted your connection request`;
      case 'connectionRequested':
        return `${user} sent you a connection request`;
      default:
        return 'Unknown activity';
    }
  };
  
  // Format timestamp
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}10` }]}>
        <Icon size={20} color={iconColor} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.message}>{getActivityMessage()}</Text>
        <Text style={styles.timestamp}>{formatTimeAgo(timestamp)}</Text>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Inter-Medium',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
});