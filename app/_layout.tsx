import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-get-random-values';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConnectionProvider } from '@/contexts/ConnectionContext';
import { FileProvider } from '@/contexts/FileContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationCenter from '@/components/ui/NotificationCenter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [isReady, setIsReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Initialize the app (load any persisted data, etc.)
      const prepare = async () => {
        // Simulate some initialization time
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsReady(true);
        await SplashScreen.hideAsync();
      };
      
      prepare();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading SecureShare...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationProvider>
        <AuthProvider>
          <ConnectionProvider>
            <FileProvider>
              <NotificationCenter />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </FileProvider>
          </ConnectionProvider>
        </AuthProvider>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
  }
});