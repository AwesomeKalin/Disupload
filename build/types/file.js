// An actual file
import { v4 as uuidv4 } from 'uuid';
export class file {
    name;
    parts = [];
    uuid;
    constructor(name, uuid) {
        if (uuid === undefined) {
            this.uuid = uuidv4();
        }
        else {
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
    getPart(id) {
        return this.parts[id];
    }
    getUUID() {
        return this.uuid;
    }
    addPart(part) {
        this.parts.push(part);
    }
    rename(name) {
        this.name = name;
    }
}
