// Credit to @forscht/ddrive
// Typescript-ified and modified to work with my code by AwesomeKalin55
import { Transform } from 'stream';
export class StreamChunker extends Transform {
    chunkSize;
    fill;
    chunks;
    constructor() {
        super();
        this.chunkSize = 7864320;
        this.fill = 0;
        this.chunks = [];
    }
    _transform(chunk, encoding, callback) {
        this.fill += chunk.length;
        this.chunks.push(chunk);
        while (this.fill >= this.chunkSize) {
            this.push(Buffer.concat(this.chunks, this.chunkSize));
            const lastChunk = this.chunks[this.chunks.length - 1];
            const residue = this.fill - this.chunkSize;
            this.chunks = residue === 0 ? [] : [Buffer.from(lastChunk.subarray(lastChunk.length - residue))];
            this.fill = residue;
        }
        callback();
    }
    _flush(callback) {
        this.push(Buffer.concat(this.chunks));
        callback();
    }
}
export class AsyncStreamChunker extends Transform {
    chunkProcessor;
    constructor(chunkProcessor) {
        super();
        this.chunkProcessor = chunkProcessor;
    }
    _transform(chunk, encoding, callback) {
        this.chunkProcessor(chunk)
            .then(() => callback(null))
            .catch((err) => console.log(err));
    }
}
