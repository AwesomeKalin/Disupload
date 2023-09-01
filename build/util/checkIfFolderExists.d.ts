import { directory } from "../types/directory.js";
import { file } from "../types/file.js";
export declare function checkIfFileExists(directoriesList: Array<directory>, folderNum: number, folders: string[]): boolean;
export declare function checkIfFolderExists(directoriesList: Array<directory>, folderNum: number, folders: string[]): boolean;
export declare function getExistingFile(directoriesList: Array<directory>, folderNum: number, folders: string[]): false | file;
export declare function getExistingFolder(directoriesList: Array<directory>, folderNum: number, folders: string[]): false | directory;
