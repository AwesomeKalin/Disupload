import { v4 as uuidv4 } from 'uuid';
import { deleteFromArray } from '../util/deleteFromArray.js';
import { file } from './file.js'; 

// A Directory/folder

export class directory {
    name: string;
    uuid: string;
    directories: Array<directory>;
    files: Array<file>;

    constructor (name: string, uuid: string) {
        this.name = name;
        if(uuid === undefined) {
            this.uuid = uuidv4();
        } else {
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

    getDirectory(id: number) {
        return this.directories[id];
    }

    getFileList() {
        return this.files;
    }

    getFile(id: number) {
        return this.files[id];
    }

    addDirectory(folder: directory) {
        this.directories.push(folder);
    }

    addFile(file: file) {
        this.files.push(file);
    }
    
    deleteDirectory(id: number) {
        this.directories == deleteFromArray(this.directories, id);
    }

    deleteFile(id: number) {
        this.files == deleteFromArray(this.files, id);
    }

    rename(name: string) {
        this.name = name;
    }
}