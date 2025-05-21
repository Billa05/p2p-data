import { randomBytes } from 'react-native-get-random-values';
import * as nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateKeyPair(): Promise<KeyPair> {
  // Generate a new key pair using Ed25519
  const keyPair = nacl.sign.keyPair();
  
  // Convert the keys to base64 strings for storage
  const publicKey = encodeBase64(keyPair.publicKey);
  const privateKey = encodeBase64(keyPair.secretKey);
  
  return {
    publicKey,
    privateKey,
  };
}

export async function encryptMessage(message: string, publicKey: string): Promise<string> {
  // Generate a new ephemeral key pair for this message
  const ephemeralKeyPair = nacl.box.keyPair();
  
  // Convert the recipient's public key from base64
  const recipientPublicKey = decodeBase64(publicKey);
  
  // Generate a random nonce
  const nonce = randomBytes(nacl.box.nonceLength);
  
  // Convert the message to Uint8Array
  const messageBytes = decodeUTF8(message);
  
  // Encrypt the message
  const encryptedMessage = nacl.box(
    messageBytes,
    nonce,
    recipientPublicKey,
    ephemeralKeyPair.secretKey
  );
  
  // Combine the ephemeral public key, nonce, and encrypted message
  const fullMessage = new Uint8Array(
    ephemeralKeyPair.publicKey.length + nonce.length + encryptedMessage.length
  );
  fullMessage.set(ephemeralKeyPair.publicKey);
  fullMessage.set(nonce, ephemeralKeyPair.publicKey.length);
  fullMessage.set(encryptedMessage, ephemeralKeyPair.publicKey.length + nonce.length);
  
  // Return the combined message as base64
  return encodeBase64(fullMessage);
}

export async function decryptMessage(encryptedMessage: string, privateKey: string): Promise<string> {
  // Convert the encrypted message from base64
  const fullMessage = decodeBase64(encryptedMessage);
  
  // Extract the ephemeral public key, nonce, and encrypted message
  const ephemeralPublicKey = fullMessage.slice(0, nacl.box.publicKeyLength);
  const nonce = fullMessage.slice(
    nacl.box.publicKeyLength,
    nacl.box.publicKeyLength + nacl.box.nonceLength
  );
  const message = fullMessage.slice(nacl.box.publicKeyLength + nacl.box.nonceLength);
  
  // Convert the private key from base64
  const secretKey = decodeBase64(privateKey);
  
  // Decrypt the message
  const decryptedMessage = nacl.box.open(
    message,
    nonce,
    ephemeralPublicKey,
    secretKey
  );
  
  if (!decryptedMessage) {
    throw new Error('Failed to decrypt message');
  }
  
  // Convert the decrypted message to string
  return encodeUTF8(decryptedMessage);
}

// Helper function to generate a random string
export function generateRandomString(length: number): string {
  const bytes = randomBytes(length);
  return encodeBase64(bytes).slice(0, length);
} 