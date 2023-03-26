import { directory } from "../types/directory.js";
import { file } from "../types/file.js";

export function addFileToFolder(directoriesList: Array<directory>, folderNum: number, folders: string[], file: file) {
    for (var i = 0; i <= directoriesList.length; i++) {
        if (directoriesList[i].getName() == folders[folderNum]) {
            if (folderNum + 1 != folders.length) {
                // Add File to list
                directoriesList[i].addFile(file);
                return directoriesList;
            }
            directoriesList = addFileToFolder(directoriesList[i].getDirectoryList(), folderNum+1, folders, file);
            return directoriesList;
        }
    }
}

export function addFolderToFolder(directoriesList: Array<directory>, folderNum: number, folders: string[], folder: directory) {
    for (var i = 0; i <= directoriesList.length; i++) {
        if (directoriesList[i].getName() == folders[folderNum]) {
            if (folderNum + 1 != folders.length) {
                // Add File to list
                directoriesList[i].addDirectory(folder);
                return directoriesList;
            }
            directoriesList = addFolderToFolder(directoriesList[i].getDirectoryList(), folderNum+1, folders, folder);
            return directoriesList;
        }
    }
}