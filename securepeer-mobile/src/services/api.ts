import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ConnectionRequest, ConnectionResponse, SignalingMessage, UserProfile } from '../types';
import { Platform } from 'react-native';

// Use different URLs for Android emulator and physical devices
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000'  // Android emulator
  : 'http://192.168.0.105:3000';  // Physical device or iOS simulator

export class ApiService {
  private socket: Socket | null = null;
  private userProfile: UserProfile | null = null;

  // Getter for user profile
  get currentUser(): UserProfile | null {
    return this.userProfile;
  }

  async initialize() {
    this.userProfile = await this.loadUserProfile();
    if (this.userProfile) {
      this.connectSocket();
    }
  }

  async loadUserProfile(): Promise<UserProfile | null> {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  private async saveUserProfile(profile: UserProfile) {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      this.userProfile = profile;
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  private connectSocket() {
    if (!this.userProfile) return;

    this.socket = io(API_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.socket?.emit('register', this.userProfile?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });
  }

  async registerUser(username: string, publicKey: string, privateKey: string): Promise<UserProfile> {
    const deviceId = Math.random().toString(36).substring(7);
    
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        publicKey,
        deviceId,
      }),
    });

    const data = await response.json();
    const profile: UserProfile = {
      id: data.userId,
      username,
      publicKey,
      privateKey,
      deviceId,
    };

    await this.saveUserProfile(profile);
    this.connectSocket();
    
    return profile;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`${API_URL}/api/users/search?query=${encodeURIComponent(query)}`);
    return response.json();
  }

  sendConnectionRequest(request: ConnectionRequest) {
    this.socket?.emit('connection_request', request);
  }

  sendConnectionResponse(response: ConnectionResponse) {
    this.socket?.emit('connection_response', response);
  }

  sendSignalingMessage(message: SignalingMessage) {
    this.socket?.emit('signaling_message', message);
  }

  onConnectionRequest(callback: (request: ConnectionRequest) => void) {
    this.socket?.on('connection_request', callback);
  }

  onConnectionResponse(callback: (response: ConnectionResponse) => void) {
    this.socket?.on('connection_response', callback);
  }

  onSignalingMessage(callback: (message: SignalingMessage) => void) {
    this.socket?.on('signaling_message', callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const apiService = new ApiService(); 