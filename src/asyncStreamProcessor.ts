import { Transform } from 'stream';

export class AsyncStreamProcessor extends Transform {
    chunkProcessor: any;

    constructor(chunkProcessor: any) {
        super()
        this.chunkProcessor = chunkProcessor
    }

    _transform(chunk: any, encoding: any, callback: (arg0: any) => any) {
        this.chunkProcessor(chunk)
            .then(() => callback(null))
            .catch((err: any) => callback(err))
    }
}
