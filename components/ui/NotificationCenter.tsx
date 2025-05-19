import React from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationBanner from './NotificationBanner';
import { useNotification } from '@/contexts/NotificationContext';
import { useContext } from 'react';
import { FileContext } from '@/contexts/FileContext';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotification();
  const { acceptFileShare } = useContext(FileContext);

  if (notifications.length === 0) return null;

  const handleAccept = async (fileMeta: any) => {
    await acceptFileShare(fileMeta);
    // Optionally remove the notification after accepting
    const notif = notifications.find(n => n.data && n.data.id === fileMeta.id);
    if (notif) removeNotification(notif.id);
  };
  const handleDecline = (id: string) => {
    removeNotification(id);
    // Optionally: notify sender of decline
  };

  return (
    <View style={styles.center} pointerEvents="box-none">
      {notifications.map(n => (
        <NotificationBanner
          key={n.id}
          notification={n}
          onDismiss={removeNotification}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
});
