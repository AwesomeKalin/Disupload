import { directory } from "../types/directory.js";
import { file } from "../types/file.js";
export declare function addFileToFolder(directoriesList: Array<directory>, folderNum: number, folders: string[], file: file): directory[];
export declare function addFolderToFolder(directoriesList: Array<directory>, folderNum: number, folders: string[], folder: directory): directory[];
