import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useCameraPermissions } from 'expo-camera';
import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import Button from '@/components/ui/Button';

const requiredPermissions = [
  { key: 'mediaLibrary', label: 'Storage/Media Library' },
  { key: 'camera', label: 'Camera' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'notifications', label: 'Notifications' },
];

export default function PermissionsScreen() {
  const [status, setStatus] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const requestPermission = async (perm: string) => {
    setLoading(true);
    try {
      let result;
      switch (perm) {
        case 'mediaLibrary':
          result = await MediaLibrary.requestPermissionsAsync();
          break;
        case 'camera':
          result = await requestCameraPermission();
          break;
        case 'contacts':
          result = await Contacts.requestPermissionsAsync();
          break;
        case 'notifications':
          result = await Notifications.requestPermissionsAsync();
          break;
        default:
          return;
      }
      setStatus(prev => ({ ...prev, [perm]: result.status }));
    } catch (e) {
      setStatus(prev => ({ ...prev, [perm]: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const allGranted = requiredPermissions.every(
    p => status[p.key] === 'granted'
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Permissions</Text>
      <Text style={styles.subtitle}>
        To enable secure P2P sharing, please grant the following permissions:
      </Text>
      {requiredPermissions.map(p => (
        <View key={p.key} style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>{p.label}</Text>
          <Button
            title={status[p.key] === 'granted' ? 'Granted' : 'Grant'}
            onPress={() => requestPermission(p.key)}
            isLoading={loading}
            disabled={status[p.key] === 'granted'}
            style={styles.button}
          />
        </View>
      ))}
      <Button
        title="Continue"
        onPress={() => router.replace('/(tabs)')}
        disabled={!allGranted}
        style={styles.continueButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    justifyContent: 'space-between',
  },
  permissionLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  button: {
    minWidth: 100,
  },
  continueButton: {
    marginTop: 32,
  },
});
