export interface User {
  id: string;
  username: string;
  publicKey: string;
  deviceId: string;
}

export interface ConnectionRequest {
  from: string;
  to: string;
  publicKey: string;
  profileInfo: {
    username: string;
  };
}

export interface ConnectionResponse {
  accepted: boolean;
  from: string;
  to: string;
  publicKey: string;
}

export interface SignalingMessage {
  type: 'connection_request' | 'connection_response' | 'ice_candidate' | 'offer' | 'answer';
  data: any;
} 