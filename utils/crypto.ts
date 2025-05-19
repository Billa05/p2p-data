import * as sodium from 'libsodium-wrappers';

export async function generateSecureKeys() {
  // Wait for sodium to be ready
  await sodium.ready;
  
  // Generate a key pair
  const keyPair = sodium.crypto_box_keypair();
  
  // Convert keys to hex strings for storage
  const publicKey = sodium.to_hex(keyPair.publicKey);
  const privateKey = sodium.to_hex(keyPair.privateKey);
  
  return { publicKey, privateKey };
}

export async function encryptMessage(message: string, recipientPublicKey: string, senderPrivateKey: string) {
  await sodium.ready;
  
  // Convert keys from hex strings to Uint8Array
  const publicKeyBytes = sodium.from_hex(recipientPublicKey);
  const privateKeyBytes = sodium.from_hex(senderPrivateKey);
  
  // Convert message to Uint8Array
  const messageBytes = sodium.from_string(message);
  
  // Generate a nonce
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  
  // Encrypt the message
  const encryptedMessage = sodium.crypto_box_easy(
    messageBytes,
    nonce,
    publicKeyBytes,
    privateKeyBytes
  );
  
  // Return encrypted message and nonce as hex strings
  return {
    encryptedMessage: sodium.to_hex(encryptedMessage),
    nonce: sodium.to_hex(nonce),
  };
}

export async function decryptMessage(
  encryptedMessageHex: string,
  nonceHex: string,
  senderPublicKey: string,
  recipientPrivateKey: string
) {
  await sodium.ready;
  
  // Convert from hex strings to Uint8Array
  const encryptedMessage = sodium.from_hex(encryptedMessageHex);
  const nonce = sodium.from_hex(nonceHex);
  const publicKeyBytes = sodium.from_hex(senderPublicKey);
  const privateKeyBytes = sodium.from_hex(recipientPrivateKey);
  
  // Decrypt the message
  const decryptedMessage = sodium.crypto_box_open_easy(
    encryptedMessage,
    nonce,
    publicKeyBytes,
    privateKeyBytes
  );
  
  // Convert the decrypted message from Uint8Array to string
  return sodium.to_string(decryptedMessage);
}