import * as openpgp from 'openpgp';

// Encrypt a buffer using a given secret key
export async function encryptBuffer(buffer: Buffer, key: string) {
    const message: openpgp.Message<Buffer> = await openpgp.createMessage({ binary: buffer });
    const encrypted: Uint8Array = await openpgp.encrypt({
        message,
        passwords: [key],
        format: 'binary',
    });
    return Buffer.from(encrypted);
}

// Decrypt a buffer using a given secret key
export async function decryptBuffer(b: Buffer, key: string) {
    const message: openpgp.Message<Buffer> = await openpgp.readMessage({ binaryMessage: b });
    const { data: decrypted } = await openpgp.decrypt({
        message,
        passwords: [key],
        format: 'binary',
    });
    return Buffer.from(decrypted);
}