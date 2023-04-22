import { Client, Events, GatewayIntentBits } from 'discord.js';
import { directory } from './types/directory.js';
import { file } from './types/file.js';
import { checkIfFileExists, checkIfFolderExists, getExistingFile, getExistingFolder } from './util/checkIfFolderExists.js';
import { v4 as uuidv4 } from 'uuid';
import { createPart } from './util/createPart.js';
import { AsyncStreamChunker, StreamChunker } from './util/streamChunker.js';
import { deleteFromArray, deleteSpecificObject, removeItem } from './util/deleteFromArray.js';
import { addFileToFolder, addFolderToFolder } from './util/addFileToFolder.js';
import { createFolder } from './util/createFolder.js';
import { filePart } from './types/filePart.js';
import { getAllMessages } from './util/getAllMessagesFromChannel.js';
// The Discord Bot
export class discordBot {
    channelId;
    token;
    channel;
    client;
    uploadLock;
    channelCache;
    root;
    encryptionKey;
    constructor(channelId, token, encryptionKey) {
        this.channelId = channelId;
        this.token = token;
        this.uploadLock = [];
        this.root = new directory('.', uuidv4());
        this.encryptionKey = encryptionKey;
    }
    // Starts the bot
    async start() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        this.client.login(this.token);
        this.client.once(Events.ClientReady, c => {
            console.log(`Bot logged in as ${c.user.tag}`);
        });
        this.client.on('ready', async () => {
            this.channelCache = this.client.channels.cache.get(this.channelId) || await this.client.channels.fetch(this.channelId);
            console.log('Loading messages');
            const messagesArray = (await getAllMessages(this.channelCache)).reverse();
            console.log('Parsing messages');
            let partsToAssociate = [];
            for (var i = 0; i < messagesArray.length; i++) {
                const messageContents = messagesArray[i].content;
                let messageAttachment;
                try {
                    messageAttachment = messagesArray[i].attachments.first().url;
                }
                catch {
                }
                const messageJson = JSON.parse(messageContents);
                if (messageJson["action"] == "createFolder") {
                    let name = messageJson["name"];
                    const uuid = messageJson["folderUUID"];
                    let folders;
                    if (name.includes('/')) {
                        folders = name.split('/');
                        folders = folders.splice(1, folders.length - 1);
                        name = folders[folders.length - 1];
                    }
                    else
                        folders = ['.'];
                    const folder = new directory(name, uuid);
                    this.addFolderToDir(folders, folder);
                }
                else if (messageJson["action"] == 'addPart') {
                    const partToAdd = new filePart(messageAttachment, messageJson["partUUID"], messageJson["fileUUID"]);
                    partsToAssociate.push(partToAdd);
                }
                else if (messageJson["action"] == 'uploadFile') {
                    let name = messageJson["name"];
                    const uuid = messageJson["uuid"];
                    let folders;
                    if (name.includes('/')) {
                        name = name.slice(1);
                        folders = name.split('/');
                        name = folders[folders.length - 1];
                    }
                    else {
                        folders = [name];
                    }
                    let fileToAdd = new file(name, uuid);
                    var j = 0;
                    while (j < partsToAssociate.length) {
                        if (partsToAssociate[j].fileUUID == uuid) {
                            fileToAdd.addPart(partsToAssociate[j]);
                            partsToAssociate.splice(j, 1);
                        }
                        else {
                            j++;
                        }
                    }
                    if (name == folders[0]) {
                        folders = deleteFromArray(folders, folders.length - 1);
                        this.addFileToDir(folders, fileToAdd);
                    }
                    else {
                        this.addFileToDir(folders, fileToAdd);
                    }
                }
            }
            console.log('Loaded messages');
        });
    }
    getFile(location) {
        // Steps:
        // 1. Remove first / tick
        // 2. Split remaining /'es if there are any left tick
        // 3. Check if those directories exist
        // 4. If they do, check if the file exists
        // 5. Upload if it doesn't
        location = location.slice(1);
        if (location.includes('/')) {
            if (this.root.directories.length == 0)
                return false;
            const folders = location.split('/');
            return checkIfFileExists(this.root.getDirectoryList(), 0, folders);
        }
        else {
            if (this.root.files.length == 0)
                return false;
            for (var i = 0; i <= this.root.files.length - 1; i++) {
                if (this.root.files[i].getName() == location)
                    return true;
            }
        }
        return false;
    }
    async uploadFile(location, stream) {
        // Check if file is already being uploaded
        if (this.uploadLock.includes(location))
            return false;
        // Check if file exists
        if (this.getFile(location))
            return false;
        this.uploadLock.push(location);
        const pushedToUpload = location;
        // Extract name from location
        location = location.slice(1);
        let name;
        let folders;
        if (location.includes('/')) {
            folders = location.split('/');
            name = folders[folders.length - 1];
            let checkList;
            for (var i = 0; i < folders.length - 1; i++) {
                checkList += '/' + folders[i];
                if (!this.getFolder(checkList))
                    return false;
            }
        }
        else {
            name = location;
        }
        console.log(`Uploading to ${location}`);
        // Create uuid
        const uuid = uuidv4();
        // Create file
        let upload = new file(name, uuid);
        // Variable to check if upload is aborted
        let aborted = false;
        // Create chunks
        let partNumber = 0;
        const chunkUploader = async (chunk) => {
            const entry = await createPart(partNumber, chunk, uuid, this, this.encryptionKey);
            if (aborted)
                return false;
            upload.addPart(entry);
            partNumber += 1;
        };
        const handleAbort = async (cb, err) => {
            aborted = true;
            this.uploadLock = deleteSpecificObject(this.uploadLock, pushedToUpload);
            cb(err);
        };
        // Consume Stream
        return new Promise((resolve, reject) => {
            stream
                .on('aborted', () => handleAbort(reject, console.log('File Upload Aborted')))
                .pipe(new StreamChunker())
                .pipe(new AsyncStreamChunker(chunkUploader))
                .on('finish', () => {
                var message;
                if (name != location) {
                    this.addFileToDir(folders, upload);
                    message = {
                        action: "uploadFile",
                        name: pushedToUpload,
                        uuid: uuid,
                        parts: partNumber,
                        location: removeItem(folders)
                    };
                }
                else {
                    this.addFileToDir(["."], upload);
                    message = {
                        action: "uploadFile",
                        name: name,
                        uuid: uuid,
                        parts: partNumber,
                        location: ["."]
                    };
                }
                this.sendMessage(JSON.stringify(message));
                console.log(`Uploaded ${location}`);
                this.uploadLock = deleteSpecificObject(this.uploadLock, pushedToUpload);
                resolve(file);
            })
                .on('error', (err) => handleAbort(reject, err));
        });
    }
    async sendMessage(contents) {
        this.channelCache.send(contents);
    }
    async sendMessageWithAttachment(message, file, fileName) {
        const messageSent = this.channelCache.send({ content: message, files: [{ attachment: file, name: fileName }] });
        return (await messageSent).attachments.first().url;
    }
    addFileToDir(location, file) {
        /*
        Steps:
        1. Get the folder it is in
        2. Insert file to list
        3. Add back to list
        */
        if (location[0] == "." || location.length == 0) {
            this.root.addFile(file);
            return;
        }
        this.root.directories = addFileToFolder(this.root.getDirectoryList(), 0, location, file);
        return;
    }
    async createFolder(location) {
        if (this.uploadLock.includes(location))
            return false;
        if (this.getFolder(location))
            return false;
        this.uploadLock.push(location);
        const pushedToUpload = location;
        // Extract name from location
        location = location.slice(1);
        let name;
        let folders;
        if (location.includes('/')) {
            folders = location.split('/');
            name = folders[folders.length - 1];
            let checkList;
            for (var i = 0; i < folders.length - 1; i++) {
                checkList += '/' + folders[i];
                if (!this.getFolder(checkList))
                    return false;
            }
        }
        else {
            name = location;
        }
        console.log(`Creating folder at ${location}`);
        // Create uuid
        const uuid = uuidv4();
        // Create directory
        const directoryToAdd = new directory(name, uuid);
        if (name != location) {
            this.addFolderToDir(folders, directoryToAdd);
            await createFolder(uuid, this, pushedToUpload);
        }
        else {
            this.addFolderToDir(["."], directoryToAdd);
            await createFolder(uuid, this, name);
        }
        return true;
    }
    getFolder(location) {
        // Steps:
        // 1. Remove first / tick
        // 2. Split remaining /'es if there are any left tick
        // 3. Check if those directories exist
        // 4. If they do, check if the file exists
        // 5. Upload if it doesn't
        location = location.slice(1);
        if (location.includes('/')) {
            const folders = location.split('/');
            if (checkIfFolderExists(this.root.getDirectoryList(), 0, folders))
                return true;
        }
        for (var i = 0; i <= this.root.directories.length - 1; i++) {
            if (this.root.directories[i].getName() == location)
                return true;
        }
        return false;
    }
    addFolderToDir(location, folder) {
        /*
        Steps:
        1. Get the folder it is in
        2. Insert file to list
        3. Add back to list
        */
        if (location[0] == "." || location.length == 0) {
            this.root.addDirectory(folder);
            return;
        }
        this.root.directories = addFolderToFolder(this.root.getDirectoryList(), 0, location, folder);
        return;
    }
    fileOrFolder(location) {
        if (this.getFile(location)) {
            return 0;
        }
        else if (this.getFolder(location)) {
            return 1;
        }
        return 2;
    }
    getFileForDownload(location) {
        location = location.slice(1);
        if (location.includes('/')) {
            const folders = location.split('/');
            return getExistingFile(this.root.getDirectoryList(), 0, folders);
        }
        else {
            for (var i = 0; i <= this.root.getFileList().length - 1; i++) {
                if (this.root.getFile(i).getName() == location)
                    return this.root.getFile(i);
            }
        }
    }
    getFilesFromFolderAsString(location) {
        if (location == '.') {
            let stringList = [];
            for (var i = 0; i <= this.root.directories.length - 1; i++) {
                stringList.push(this.root.directories[i].getName());
            }
            for (var i = 0; i <= this.root.files.length - 1; i++) {
                stringList.push(this.root.files[i].getName());
            }
            return stringList;
        }
        location = location.slice(1);
        if (location.includes('/')) {
            const folders = location.split('/');
            const folderList = getExistingFolder(this.root.getDirectoryList(), 0, folders);
            const dirListToShow = folderList.getDirectoryList();
            const fileList = folderList.getFileList();
            let stringList = [];
            for (var i = 0; i <= dirListToShow.length - 1; i++) {
                stringList.push(dirListToShow[i].getName());
            }
            for (var i = 0; i <= fileList.length - 1; i++) {
                stringList.push(fileList[i].getName());
            }
            return stringList;
        }
        else {
            let dirList;
            for (var j = 0; j <= this.root.getDirectoryList().length - 1; j++) {
                if (this.root.getDirectory(j).getName() == location) {
                    dirList = this.root.getDirectory(j);
                }
            }
            const dirListToShow = dirList.getDirectoryList();
            const fileList = dirList.getFileList();
            let stringList = [];
            for (var i = 0; i <= dirListToShow.length - 1; i++) {
                stringList.push(dirListToShow[i].getName());
            }
            for (var i = 0; i <= fileList.length - 1; i++) {
                stringList.push(fileList[i].getName());
            }
            return stringList;
        }
    }
}
