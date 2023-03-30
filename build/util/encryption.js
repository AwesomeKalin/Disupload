import * as openpgp from 'openpgp';
// Encrypt a buffer using a given secret key
export async function encryptBuffer(buffer, key) {
    const message = await openpgp.createMessage({ binary: buffer });
    const encrypted = await openpgp.encrypt({
        message,
        passwords: [key],
        format: 'binary',
    });
    return Buffer.from(encrypted);
}
// Decrypt a buffer using a given secret key
export async function decryptBuffer(b, key) {
    const encrypted = b.subarray(b.byteOffset, b.byteOffset + b.byteLength);
    const message = await openpgp.readMessage({ binaryMessage: encrypted });
    const { data: decrypted } = await openpgp.decrypt({
        message,
        passwords: [key],
        format: 'binary',
    });
    return Buffer.from(decrypted);
}
