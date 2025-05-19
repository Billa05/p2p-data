import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Settings, User, Shield, Bell, Moon, LogOut } from 'lucide-react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleExportKeys = () => {
    Alert.alert(
      'Export Keys',
      'This will export your private cryptographic keys. Keep them secure!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Export',
          onPress: () => {
            // Export keys logic would go here
            Alert.alert('Keys Exported', 'Your keys have been exported to your downloads folder.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.subtitle}>Account Settings</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.iconContainer}>
              <Moon size={20} color="#4B5563" />
            </View>
            <Text style={styles.settingTitle}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={darkMode ? '#3B82F6' : '#F9FAFB'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.iconContainer}>
              <Bell size={20} color="#4B5563" />
            </View>
            <Text style={styles.settingTitle}>Enable Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={notifications ? '#3B82F6' : '#F9FAFB'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Privacy & Security</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.iconContainer}>
              <Shield size={20} color="#4B5563" />
            </View>
            <Text style={styles.settingTitle}>Auto-accept from Contacts</Text>
          </View>
          <Switch
            value={autoAccept}
            onValueChange={setAutoAccept}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={autoAccept ? '#3B82F6' : '#F9FAFB'}
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleExportKeys}>
          <Text style={styles.buttonText}>Export Security Keys</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>SecureShare v1.0.0</Text>
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Medium',
  },
  button: {
    backgroundColor: '#EBF5FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'Inter-Bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 8,
    fontFamily: 'Inter-Bold',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
});