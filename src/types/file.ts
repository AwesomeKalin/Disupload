// An actual file

import { filePart } from "./filePart.js";
import { v4 as uuidv4 } from 'uuid';

export class file {
    name: string;
    parts: [filePart];
    uuid: string;

    constructor (name: string, uuid: string) {
        if (uuid === undefined) {
            this.uuid = uuidv4();
        } else {
            this.uuid = uuid;
        }
        this.name = name;
    }

    getName() {
        return this.name;
    }

    getPartsList() {
        return this.parts;
    }

    getPart(id: number) {
        return this.parts[id];
    }

    getUUID() {
        return this.uuid;
    }

    addPart(url: string, partUUID: string) {
        this.parts.push(new filePart(url, partUUID));
    }

    rename(name: string) {
        this.name = name;
    }
}