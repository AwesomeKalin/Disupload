import { directory } from "../types/directory.js";
import { file } from "../types/file.js";

export function addFileToFolder(directoriesList: Array<directory>, folderNum: number, folders: string[], file: file) {
    try {
        for (var i = 0; i <= directoriesList.length - 1; i++) {
            if (directoriesList[i].getName() == folders[folderNum]) {
                if (folderNum + 1 == folders.length - 1) {
                    // Add File to list
                    directoriesList[i].addFile(file);
                    return directoriesList;
                }
                directoriesList[i].directories = addFileToFolder(directoriesList[i].getDirectoryList(), folderNum + 1, folders, file);
                return directoriesList;
            }

        }
    } catch {
        return directoriesList;
    }
}

export function addFolderToFolder(directoriesList: Array<directory>, folderNum: number, folders: string[], folder: directory) {
    const origDirList: Array<directory> = directoriesList;
    try {
        for (var i = 0; i <= directoriesList.length - 1; i++) {
            if (directoriesList[i].getName() == folders[folderNum]) {
                if (folderNum + 1 == folders.length - 1) {
                    // Add File to list
                    directoriesList[i].addDirectory(folder);
                    return directoriesList;
                }
                directoriesList[i].directories = addFolderToFolder(directoriesList[i].getDirectoryList(), folderNum + 1, folders, folder);
                return directoriesList;
            }

        }
    } catch {
        return origDirList;
    }
}