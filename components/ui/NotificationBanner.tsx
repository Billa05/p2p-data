import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { AppNotification } from '@/contexts/NotificationContext';

interface NotificationBannerProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
  onAccept?: (data: any) => void;
  onDecline?: (id: string) => void;
}

export default function NotificationBanner({ notification, onDismiss, onAccept, onDecline }: NotificationBannerProps) {
  const isFileRequest = notification.type === 'request' && notification.data && notification.data.name;
  return (
    <Animated.View style={[styles.banner, styles[notification.type]]}>
      <Text style={styles.message}>{notification.message}</Text>
      {isFileRequest ? (
        <>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onAccept && onAccept(notification.data)}>
            <Text style={styles.accept}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onDecline && onDecline(notification.id)}>
            <Text style={styles.decline}>Decline</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={() => onDismiss(notification.id)}>
          <Text style={styles.dismiss}>Dismiss</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 16,
    borderRadius: 8,
    margin: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#E0E7FF',
  },
  accept: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  decline: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#DBEAFE',
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  error: {
    backgroundColor: '#FECACA',
  },
  request: {
    backgroundColor: '#FFF7ED',
  },
  transfer: {
    backgroundColor: '#E0E7FF',
  },
  message: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  dismiss: {
    marginLeft: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});
