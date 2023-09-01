import { directory } from "../types/directory.js";
import { deleteFromArray } from "./deleteFromArray.js";

export function deleteInFolder(dirList: directory, folderNum: number, folders: Array<string>) {
    if ((folders.length - 1) !== folderNum) {
        for (var i = 0; i < dirList.directories.length; i++) {
            const deleteAttempt: directory | false = deleteInFolder(dirList.directories[i], folderNum + 1, folders);

            if (deleteAttempt !== false) {
                dirList.directories[i] = deleteAttempt;
                return dirList;
            }

            return false;
        }
    }

    let isFileDeleted: boolean = false;

    for (var i = 0; i < dirList.directories.length; i++) {
        if (dirList.directories[i].getName() == folders[folderNum]) {
            dirList.directories = deleteFromArray(dirList.directories, i);
            isFileDeleted = true;
        }
    }

    for (var i = 0; i < dirList.files.length; i++) {
        if (dirList.files[i].getName() == folders[folderNum]) {
            dirList.files = deleteFromArray(dirList.files, i);
            isFileDeleted = true;
        }
    }

    if (!isFileDeleted) {
        return false;
    }

    return dirList;
}