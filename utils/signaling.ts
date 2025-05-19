// utils/signaling.ts
// Utility for communicating with the signaling server (placeholder implementation)

const SIGNALING_SERVER_URL = 'https://your-signaling-server.com/api'; // TODO: Replace with your actual server

export interface UserProfile {
  id: string;
  username: string;
  publicKey: string;
}

export interface ConnectionRequest {
  from: UserProfile;
  to: UserProfile;
  message?: string;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'file-metadata' | 'file-request';
  from: string; // sender user id
  to: string;   // recipient user id
  data: any;
}

// Register user/device with signaling server
export async function registerUser(profile: UserProfile) {
  const res = await fetch(`${SIGNALING_SERVER_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('Failed to register user');
  return await res.json();
}

// Search users by username/email/phone
export async function searchUsers(query: string) {
  const res = await fetch(`${SIGNALING_SERVER_URL}/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search users');
  return await res.json();
}

// Send a connection request
export async function sendConnectionRequest(request: ConnectionRequest) {
  const res = await fetch(`${SIGNALING_SERVER_URL}/connection-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to send connection request');
  return await res.json();
}

// Listen for incoming connection requests (polling or websocket)
export async function getIncomingRequests(userId: string) {
  const res = await fetch(`${SIGNALING_SERVER_URL}/incoming-requests?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to get incoming requests');
  return await res.json();
}

// Send WebRTC signaling message (offer/answer/ICE)
export async function sendSignal(signal: WebRTCSignal) {
  const res = await fetch(`${SIGNALING_SERVER_URL}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signal),
  });
  if (!res.ok) throw new Error('Failed to send signal');
  return await res.json();
}

// Listen for incoming signals (polling or websocket)
export async function getIncomingSignals(userId: string) {
  const res = await fetch(`${SIGNALING_SERVER_URL}/incoming-signals?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to get incoming signals');
  return await res.json();
}
