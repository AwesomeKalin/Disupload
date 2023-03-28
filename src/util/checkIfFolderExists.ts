import { directory } from "../types/directory.js";
import { file } from "../types/file.js";

export function checkIfFileExists(directoriesList: Array<directory>, folderNum: number, folders: string[]) {
    for (var i = 0; i <= directoriesList.length - 1; i++) {
        if (directoriesList[i].name == folders[folderNum]) {
            if (folderNum + 1 != folders.length - 1) {
                return checkIfFileExists(directoriesList[i].directories, folderNum += 1, folders);
            } else {
                // Steps
                // 1. Get File List
                // 2. Check all files and check name
                const fileList: Array<file> = directoriesList[i].files;
                for (var j = 0; j <= fileList.length - 1; j++) {
                    if (fileList[j].name == folders[folderNum + 1]) return true;
                }
                return false;
            }
        }
    }
    return false;
}

export function checkIfFolderExists(directoriesList: Array<directory>, folderNum: number, folders: string[]) {
    try {
        for (var i = 0; i <= directoriesList.length; i++) {
            if (directoriesList[i].name == folders[folderNum]) {
                if (folderNum + 1 != folders.length - 1) {
                    return checkIfFolderExists(directoriesList[i].directories, folderNum += 1, folders);
                } else {
                    // Steps
                    // 1. Get File List
                    // 2. Check all files and check name
                    const fileList: Array<directory> = directoriesList[i].directories;
                    for (var j = 0; j < fileList.length; j++) {
                        if (fileList[j].name == folders[folderNum + 1]) return true;
                    }
                    return false;
                }
            }
        }
    } catch {

    }
    return false;
}

export function getExistingFile(directoriesList: Array<directory>, folderNum: number, folders: string[]) {
    for (var i = 0; i <= directoriesList.length - 1; i++) {
        if (directoriesList[i].getName() == folders[folderNum]) {
            if (folderNum + 1 != folders.length - 1) {
                return getExistingFile(directoriesList[i].getDirectoryList(), folderNum += 1, folders);
            } else {
                // Steps
                // 1. Get File List
                // 2. Check all files and check name
                const fileList: Array<file> = directoriesList[i].getFileList();
                for (var j = 0; j < fileList.length; j++) {
                    if (fileList[j].getName() == folders[folderNum + 1]) return fileList[j];
                }
                return false;
            }
        }
    }
}

export function getExistingFolder(directoriesList: Array<directory>, folderNum: number, folders: string[]) {
    for (var i = 0; i <= directoriesList.length - 1; i++) {
        if (directoriesList[i].getName() == folders[folderNum]) {
            if (folderNum + 1 != folders.length - 1) {
                return getExistingFolder(directoriesList[i].getDirectoryList(), folderNum += 1, folders);
            } else {
                // Steps
                // 1. Get File List
                // 2. Check all files and check name
                const fileList: Array<directory> = directoriesList[i].getDirectoryList();
                for (var j = 0; j < fileList.length; j++) {
                    if (fileList[j].getName() == folders[folderNum + 1]) return fileList[j];
                }
                return false;
            }
        }
    }
}