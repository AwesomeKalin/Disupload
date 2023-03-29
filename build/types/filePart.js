import { v4 as uuidv4 } from 'uuid';
// The part of a file
export class filePart {
    url;
    partUUID;
    fileUUID;
    constructor(url, partUUID, fileUUID) {
        // Check if the file is new
        if (partUUID === undefined) {
            this.partUUID = uuidv4();
        }
        else {
            this.partUUID = partUUID;
        }
        this.url = url;
        this.fileUUID = fileUUID;
    }
    getUUID() {
        return this.partUUID;
    }
    getUrl() {
        return this.url;
    }
}
