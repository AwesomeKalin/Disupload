import { v4 as uuidv4 } from 'uuid';
import { EntryType } from './entryType.js';
import { BaseEntry } from './baseEntry.js';

export class DirectoryEntry extends BaseEntry {
    type: any;
    createdAt: any;
    id: string;
    constructor(name: any, mid: any, createdAt: any, id: any) {
        super(name, mid)
        this.type = EntryType.DIRECTORY
        this.createdAt = createdAt
        this.id = id || uuidv4()
    }
}
