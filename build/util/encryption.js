// By ChatGPT
import crypto from 'crypto';
// Encrypt a buffer using a given secret key
export function encryptBuffer(buffer, key) {
    const iv = crypto.randomBytes(16);
    const keyInput = crypto.pbkdf2Sync(key, key, 10000, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-cbc', keyInput, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
}
// Decrypt a buffer using a given secret key
export function decryptBuffer(buffer, key) {
    const iv = buffer.subarray(0, 16);
    const keyInput = crypto.pbkdf2Sync(key, key, 10000, 32, 'sha256');
    const encrypted = buffer.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyInput, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted;
}
