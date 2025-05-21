# SecurePeer - P2P File Sharing App

SecurePeer is a mobile application that enables true peer-to-peer file sharing without storing your data on third-party servers. Files remain on your device and transfer directly to the recipient only when they request access.

## Features

- Complete Data Control
  - Files never upload to any central server
  - Content stays on your device until explicitly requested
  - Control over who can access your files and when

- Direct Device-to-Device Transfer
  - Files move directly between devices using WebRTC technology
  - No middleman server ever sees or stores your content
  - Transfers only happen when both users are ready

- Simplified Sharing
  - Connect with others through simple QR codes or IDs
  - Share photos, videos, documents and more
  - See who has access to your content at any time

## Project Structure

The project consists of two main components:

1. Mobile App (`securepeer-mobile/`)
   - Built with React Native and Expo
   - Handles user interface and P2P connections
   - Manages local file storage and encryption

2. Signaling Server (`securepeer-server/`)
   - Built with Node.js and Express
   - Handles user discovery and connection establishment
   - Manages WebRTC signaling

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Mobile App Setup

1. Navigate to the mobile app directory:
   ```bash
   cd securepeer-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Use the Expo Go app on your device or an emulator to run the app.

### Signaling Server Setup

1. Navigate to the server directory:
   ```bash
   cd securepeer-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on port 3000 by default.

## Development

### Mobile App

The mobile app is built with React Native and uses the following key technologies:

- Expo for cross-platform development
- React Navigation for screen management
- Socket.IO for real-time communication
- AsyncStorage for local data persistence

### Signaling Server

The signaling server is built with Node.js and uses:

- Express for the REST API
- Socket.IO for real-time communication
- TypeScript for type safety

## Security Considerations

- All file transfers are encrypted end-to-end
- Private keys are stored securely on the device
- No file data is stored on the signaling server
- Connection requests require explicit approval

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 