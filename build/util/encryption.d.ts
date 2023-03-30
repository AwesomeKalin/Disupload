/// <reference types="node" resolution-mode="require"/>
export declare function encryptBuffer(buffer: Buffer, key: string): Promise<Buffer>;
export declare function decryptBuffer(b: Buffer, key: string): Promise<Buffer>;
