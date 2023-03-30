import { file } from './file.js';
export declare class directory {
    name: string;
    uuid: string;
    directories: Array<directory>;
    files: Array<file>;
    constructor(name: string, uuid: string);
    getName(): string;
    getUUID(): string;
    getDirectoryList(): directory[];
    getDirectory(id: number): directory;
    getFileList(): file[];
    getFile(id: number): file;
    addDirectory(folder: directory): void;
    addFile(file: file): void;
    deleteDirectory(id: number): void;
    deleteFile(id: number): void;
    rename(name: string): void;
}
