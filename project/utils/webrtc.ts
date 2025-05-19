import Peer, { PeerJSOption } from 'react-native-peerjs';
import { Platform } from 'react-native';

// Set up the PeerJS server configuration
const peerServerConfig = {
  host: 'peerjs.com', // Use a public PeerJS server
  secure: true,
  port: 443,
  path: '/',
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
  },
};

// Create a new peer connection
export async function createPeerConnection(userId: string) {
  // In a web environment, use the standard PeerJS library
  // On native platforms, use react-native-peerjs
  const peer = new Peer(userId, peerServerConfig);
  
  return new Promise((resolve, reject) => {
    peer.on('open', (id: string) => {
      resolve({ peer, id });
    });
    
    peer.on('error', (error: any) => {
      reject(error);
    });
  });
}

// Connect to a peer
export async function connectToPeer(peer: any, peerId: string) {
  const conn = peer.connect(peerId, { reliable: true });
  
  return new Promise((resolve, reject) => {
    conn.on('open', () => {
      resolve(conn);
    });
    
    conn.on('error', (error: any) => {
      reject(error);
    });
  });
}

// Send data through a connection
export function sendData(conn: any, data: any) {
  return new Promise((resolve, reject) => {
    try {
      conn.send(data);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

// Close a connection
export function closeConnection(conn: any) {
  if (conn) {
    conn.close();
  }
}

// Close a peer
export function closePeer(peer: any) {
  if (peer) {
    peer.destroy();
  }
}

// Listen for incoming connections
export function listenForConnections(peer: any, callback: (conn: any) => void) {
  peer.on('connection', (conn: any) => {
    callback(conn);
  });
}

// Listen for data on a connection
export function listenForData(conn: any, callback: (data: any) => void) {
  conn.on('data', (data: any) => {
    callback(data);
  });
}