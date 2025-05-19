import { createContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { generateSecureKeys } from '@/utils/crypto';

// Define types for the context
interface User {
  id: string;
  username: string;
  publicKey: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if we have a user in storage when the app loads
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJSON = await getFromStorage('user');
        if (userJSON) {
          const userData = JSON.parse(userJSON);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Store data securely
  const saveToStorage = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  };

  // Get data from storage
  const getFromStorage = async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  };

  // Remove data from storage
  const removeFromStorage = async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  };

  // Login function
  const login = async (username: string) => {
    try {
      // Check if user exists in our "database"
      const existingUserJSON = await getFromStorage(`user_${username}`);
      
      if (existingUserJSON) {
        // User exists, load their data
        const userData = JSON.parse(existingUserJSON);
        setUser(userData);
        await saveToStorage('user', JSON.stringify(userData));
      } else {
        // User doesn't exist, create a new account
        await register(username);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (username: string) => {
    try {
      // Check if username already exists
      const existingUserJSON = await getFromStorage(`user_${username}`);
      if (existingUserJSON) {
        throw new Error('Username already exists');
      }

      // Generate cryptographic keys
      const { publicKey, privateKey } = await generateSecureKeys();
      
      // Create new user
      const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        username,
        publicKey,
      };
      
      // Store user data
      await saveToStorage(`user_${username}`, JSON.stringify(newUser));
      await saveToStorage(`privateKey_${newUser.id}`, privateKey);
      await saveToStorage('user', JSON.stringify(newUser));
      
      setUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await removeFromStorage('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}