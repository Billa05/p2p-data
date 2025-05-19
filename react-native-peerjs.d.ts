declare module 'react-native-peerjs' {
  export interface PeerJSOption {
    host?: string;
    port?: number;
    path?: string;
    secure?: boolean;
    config?: {
      iceServers?: Array<{ urls: string }>;
    };
  }

  export default class Peer {
    constructor(id: string, options?: PeerJSOption);
    on(event: string, callback: (data: any) => void): void;
    connect(id: string, options?: { reliable?: boolean }): any;
    destroy(): void;
  }
} 