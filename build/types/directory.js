import { v4 as uuidv4 } from 'uuid';
import { deleteFromArray } from '../util/deleteFromArray.js';
// A Directory/folder
export class directory {
    name;
    uuid;
    directories;
    files;
    constructor(name, uuid) {
        this.name = name;
        if (uuid === undefined) {
            this.uuid = uuidv4();
        }
        else {
            this.uuid = uuid;
        }
        this.directories = [];
        this.files = [];
    }
    getName() {
        return this.name;
    }
    getUUID() {
        return this.uuid;
    }
    getDirectoryList() {
        return this.directories;
    }
    getDirectory(id) {
        return this.directories[id];
    }
    getFileList() {
        return this.files;
    }
    getFile(id) {
        return this.files[id];
    }
    addDirectory(folder) {
        this.directories.push(folder);
    }
    addFile(file) {
        this.files.push(file);
    }
    deleteDirectory(id) {
        this.directories == deleteFromArray(this.directories, id);
    }
    deleteFile(id) {
        this.files == deleteFromArray(this.files, id);
    }
    rename(name) {
        this.name = name;
    }
}
