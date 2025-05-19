import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, User } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import * as SecureStore from 'expo-secure-store';

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create new account with cryptographic identity
      await register(username);
      // Register device/user with signaling server
      try {
        const userProfile = JSON.parse(await SecureStore.getItemAsync('user') || '{}');
        const { registerUser } = await import('@/utils/signaling');
        await registerUser(userProfile);
      } catch (err) {
        setError('Failed to register device with signaling server.');
        return;
      }
      router.replace('/(auth)/permissions' as any);
    } catch (err) {
      setError('Failed to create account. Please try a different username.');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/4145356/pexels-photo-4145356.jpeg' }} 
              style={styles.logo}
            />
          </View>
          
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Choose a username that others can find you by</Text>
          
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Your cryptographic identity will be generated on this device and never shared.
              Only your public profile will be visible to others.
            </Text>
          </View>
          
          <Button 
            title="Create Account" 
            onPress={handleRegister} 
            isLoading={loading}
          />
          
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
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
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },
  infoContainer: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  loginBold: {
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'Inter-Bold',
  },
});