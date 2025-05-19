import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Lock, User } from 'lucide-react-native';
import Button from '@/components/ui/Button';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to the main app
  if (isAuthenticated) {
    router.replace('/(tabs)');
    return null;
  }

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Attempt to login or create the account if it doesn't exist
      await login(username);
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/4145356/pexels-photo-4145356.jpeg' }} 
            style={styles.logoBackground}
          />
          <View style={styles.overlay} />
          <View style={styles.logoContent}>
            <Lock size={48} color="#FFFFFF" />
            <Text style={styles.appName}>SecureShare</Text>
            <Text style={styles.tagline}>Secure P2P File Sharing</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your username to continue</Text>
          
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
          
          <Button 
            title="Continue" 
            onPress={handleLogin} 
            isLoading={loading}
            style={styles.button}
          />
          
          <TouchableOpacity 
            style={styles.createAccountLink}
            onPress={handleCreateAccount}
          >
            <Text style={styles.createAccountText}>
              Don't have an account? <Text style={styles.createAccountBold}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 64, 175, 0.8)',
  },
  logoContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    fontFamily: 'Inter-Bold',
  },
  tagline: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
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
  button: {
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  createAccountLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  createAccountBold: {
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'Inter-Bold',
  },
});