/* eslint-disable no-await-in-loop,no-restricted-syntax */
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import { AsyncStreamProcessor } from '../asyncStreamProcessor.js';

export class File {
    name: string;
    parts: Array<any>;
    directoryId: any;
    createdAt: any;
    id: string;

    constructor(name: string, directoryId: any, createdAt: any, id: any) {
        this.name = name
        this.parts = []
        this.directoryId = directoryId
        this.createdAt = createdAt
        this.id = id || uuidv4()
    }

    get size() {
        return this.parts.map((p) => p.size)
            .reduce((t, s) => t + s, 0)
    }

    get chunkSize() {
        return this.parts[0].size
    }

    get sortedParts() {
        return this.parts.sort((a, b) => a.partNumber - b.partNumber)
    }

    get messageIds() {
        return this.parts.map((p) => p.mid)
    }

    rangedParts(start, end) {
        const startPartNumber = Math.ceil(start / this.chunkSize) ? Math.ceil(start / this.chunkSize) - 1 : 0
        const endPartNumber = Math.ceil(end / this.chunkSize)
        const partsToDownload = this.parts.slice(startPartNumber, endPartNumber)
        partsToDownload[0].start = start % this.chunkSize
        partsToDownload[partsToDownload.length - 1].end = end % this.chunkSize

        return partsToDownload
    }

    async download(stream, start, end) {
        console.log('>> [DOWNLOAD] in progress :', this.name)
        let partsToDownload = this.sortedParts
        if (start || end) partsToDownload = this.rangedParts(start, end)
        for (const part of partsToDownload) {
            let headers = {}
            if (part.start || part.end) headers = { Range: `bytes=${part.start || 0}-${part.end || ''}` }
            await new Promise<void>((resolve, reject) => {
                https.get(part.url, { headers }, (res) => {
                    res.pipe(new AsyncStreamProcessor(async (data) => {
                        if (!stream.write(data)) await new Promise((r) => stream.once('drain', r))
                    }))
                    res.on('error', (err) => reject(err))
                    res.on('end', () => resolve())
                })
            })
        }
        console.log('>> [DOWNLOAD] completed   :', this.name)
        stream.end()
    }
}
