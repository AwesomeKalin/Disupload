/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { Transform } from 'stream';
export declare class StreamChunker extends Transform {
    chunkSize: number;
    fill: number;
    chunks: Array<Buffer>;
    constructor();
    _transform(chunk: any, encoding: any, callback: any): void;
    _flush(callback: () => void): void;
}
export declare class AsyncStreamChunker extends Transform {
    chunkProcessor: any;
    constructor(chunkProcessor: any);
    _transform(chunk: any, encoding: any, callback: any): void;
}
