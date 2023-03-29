var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable no-await-in-loop,no-restricted-syntax */
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import { AsyncStreamProcessor } from '../asyncStreamProcessor.js';
export class File {
    constructor(name, directoryId, createdAt, id) {
        this.name = name;
        this.parts = [];
        this.directoryId = directoryId;
        this.createdAt = createdAt;
        this.id = id || uuidv4();
    }
    get size() {
        return this.parts.map((p) => p.size)
            .reduce((t, s) => t + s, 0);
    }
    get chunkSize() {
        return this.parts[0].size;
    }
    get sortedParts() {
        return this.parts.sort((a, b) => a.partNumber - b.partNumber);
    }
    get messageIds() {
        return this.parts.map((p) => p.mid);
    }
    rangedParts(start, end) {
        const startPartNumber = Math.ceil(start / this.chunkSize) ? Math.ceil(start / this.chunkSize) - 1 : 0;
        const endPartNumber = Math.ceil(end / this.chunkSize);
        const partsToDownload = this.parts.slice(startPartNumber, endPartNumber);
        partsToDownload[0].start = start % this.chunkSize;
        partsToDownload[partsToDownload.length - 1].end = end % this.chunkSize;
        return partsToDownload;
    }
    download(stream, start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('>> [DOWNLOAD] in progress :', this.name);
            let partsToDownload = this.sortedParts;
            if (start || end)
                partsToDownload = this.rangedParts(start, end);
            for (const part of partsToDownload) {
                let headers = {};
                if (part.start || part.end)
                    headers = { Range: `bytes=${part.start || 0}-${part.end || ''}` };
                yield new Promise((resolve, reject) => {
                    https.get(part.url, { headers }, (res) => {
                        res.pipe(new AsyncStreamProcessor((data) => __awaiter(this, void 0, void 0, function* () {
                            if (!stream.write(data))
                                yield new Promise((r) => stream.once('drain', r));
                        })));
                        res.on('error', (err) => reject(err));
                        res.on('end', () => resolve());
                    });
                });
            }
            console.log('>> [DOWNLOAD] completed   :', this.name);
            stream.end();
        });
    }
}
