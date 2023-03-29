export function addFileToFolder(directoriesList, folderNum, folders, file) {
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
    }
    catch {
        return directoriesList;
    }
}
export function addFolderToFolder(directoriesList, folderNum, folders, folder) {
    const origDirList = directoriesList;
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
    }
    catch {
        return origDirList;
    }
}
