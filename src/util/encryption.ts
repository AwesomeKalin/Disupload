// By ChatGPT

import crypto from 'crypto';

// Encrypt a buffer using a given secret key
export function encryptBuffer(buffer: Buffer, key: string): Buffer {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

// Decrypt a buffer using a given secret key
export function decryptBuffer(buffer: Buffer, key: string): Buffer {
  const iv = buffer.subarray(0, 16);
  const encrypted = buffer.subarray(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted;
}