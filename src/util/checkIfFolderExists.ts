import { directory } from "../types/directory.js";
import { file } from "../types/file.js";

export function checkIfFolderExists(directoriesList: Array<directory>, folderNum: number, folders: string[]) {
    for (var i = 0; i < directoriesList.length; i++) {
        if (directoriesList[i].getName() == folders[folderNum]) {
            if (folderNum + 1 != folders.length) {
                checkIfFolderExists(directoriesList[i].getDirectoryList(), folderNum += 1, folders);
            } else {
                // Steps
                // 1. Get File List
                // 2. Check all files and check name
                const fileList: [file] = directoriesList[i].getFileList();
                for (var j = 0; j < fileList.length; j++) {
                    if(fileList[j].getName() == folders[folderNum+1]) return false;
                }
                return true;
            }
            return true;
        }
    }
    return false;
}