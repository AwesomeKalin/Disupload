import { Client, Events, GatewayIntentBits, Message, TextChannel } from 'discord.js';
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
import { deleteInFolder } from './util/deleteInFolder.js';

// The Discord Bot
export class discordBot {
    channelId: string;
    token: string;
    channel: any;
    client: Client<boolean>;
    uploadLock: Array<string>;
    channelCache: TextChannel;
    root: directory;
    encryptionKey: string;

    constructor(channelId: string, token: string, encryptionKey?: string) {
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
            this.channelCache = this.client.channels.cache.get(this.channelId) as TextChannel || await this.client.channels.fetch(this.channelId) as TextChannel;

            console.log('Loading messages');

            const messagesArray: Array<any> = (await getAllMessages(this.channelCache)).reverse();

            console.log('Parsing messages');
            let partsToAssociate: Array<filePart> = [];

            for (var i = 0; i < messagesArray.length; i++) {
                const messageContents: string = messagesArray[i].content;
                let messageAttachment: string;
                try {
                    messageAttachment = messagesArray[i].attachments.first().url;
                } catch {

                }
                const messageJson: Object = JSON.parse(messageContents);
                if (messageJson["action"] == "createFolder") {
                    let name: string = messageJson["name"];
                    const uuid: string = messageJson["folderUUID"];
                    let folders: Array<string>;
                    if (name.includes('/')) {
                        folders = name.split('/');
                        folders = folders.splice(1, folders.length - 1);
                        name = folders[folders.length - 1];
                    } else folders = ['.'];
                    const folder: directory = new directory(name, uuid);
                    this.addFolderToDir(folders, folder);
                } else if (messageJson["action"] == 'addPart') {
                    const partToAdd = new filePart(messageAttachment, messageJson["partUUID"], messageJson["fileUUID"]);
                    partsToAssociate.push(partToAdd);
                } else if (messageJson["action"] == 'uploadFile') {
                    let name: string = messageJson["name"];
                    const uuid: string = messageJson["uuid"];
                    let folders: Array<string>;
                    if (name.includes('/')) {
                        name = name.slice(1);
                        folders = name.split('/');
                        name = folders[folders.length - 1];
                    } else {
                        folders = [name];
                    }
                    let fileToAdd: file = new file(name, uuid);
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
                    } else {
                        this.addFileToDir(folders, fileToAdd)
                    }
                } else if (messageJson["action"] == 'delete') {
                    let location: string = messageJson["name"];
                    const origLocation: string = location;
                    location = location.slice(1);
                    if (location.includes('/')) {
                        const folders: string[] = location.split('/');
                        if (!checkIfFileExists(this.root.directories, 0, folders) || !checkIfFolderExists(this.root.directories, 0, folders)) {
                            //@ts-expect-error
                            const delAttempt: directory  = deleteInFolder(this.root, 0, folders);

                            this.root = delAttempt;
                        }
                    } else {
                        for (var i = 0; i < this.root.directories.length; i++) {
                            if (this.root.directories[i].getName() == location) {
                                this.root.directories = deleteFromArray(this.root.directories, i);
                            }
                        }

                        for (var i = 0; i < this.root.files.length; i++) {
                            if (this.root.files[i].getName() == location) {
                                this.root.files = deleteFromArray(this.root.files, i);
                            }
                        }
                    }
                }
            }
            console.log('Loaded messages');
        });
    }

    getFile(location: string) {
        // Steps:
        // 1. Remove first / tick
        // 2. Split remaining /'es if there are any left tick
        // 3. Check if those directories exist
        // 4. If they do, check if the file exists
        // 5. Upload if it doesn't
        location = location.slice(1);
        if (location.includes('/')) {
            if (this.root.directories.length == 0) return false;
            const folders: string[] = location.split('/');
            return checkIfFileExists(this.root.getDirectoryList(), 0, folders)
        } else {
            if (this.root.files.length == 0) return false;
            for (var i = 0; i <= this.root.files.length - 1; i++) {
                if (this.root.files[i].getName() == location) return true;
            }
        }
        return false;
    }

    async uploadFile(location: string, stream: any) {
        // Check if file is already being uploaded
        if (this.uploadLock.includes(location)) return false;
        // Check if file exists
        if (this.getFile(location)) return false;
        this.uploadLock.push(location);
        const pushedToUpload: string = location;
        // Extract name from location
        location = location.slice(1);
        let name: string;
        let folders: Array<string>;
        if (location.includes('/')) {
            folders = location.split('/');
            name = folders[folders.length - 1];
            let checkList: string;
            for (var i = 0; i < folders.length - 1; i++) {
                if (i == 0) {
                    checkList = '/' + folders[i];
                } else checkList += '/' + folders[i];
                console.log(this.getFolder(checkList))
                if (!this.getFolder(checkList)) return false;
            }
        } else {
            name = location;
        }
        console.log(`Uploading to ${location}`);
        // Create uuid
        const uuid: string = uuidv4();
        // Create file
        let upload: file = new file(name, uuid);
        // Variable to check if upload is aborted
        let aborted: boolean = false;
        // Create chunks
        let partNumber: number = 0;
        const chunkUploader = async (chunk: Buffer) => {
            const entry = await createPart(partNumber, chunk, uuid, this, this.encryptionKey);
            if (aborted) return false;
            upload.addPart(entry);
            partNumber += 1;
        }

        const handleAbort = async (cb: { (reason?: any): void; (arg0: any): void; }, err: any) => {
            aborted = true;
            this.uploadLock = deleteSpecificObject(this.uploadLock, pushedToUpload);
            cb(err);
        }

        // Consume Stream
        return new Promise((resolve, reject) => {
            stream
                .on('aborted', () => handleAbort(reject, console.log('File Upload Aborted')))
                .pipe(new StreamChunker())
                .pipe(new AsyncStreamChunker(chunkUploader))
                .on('finish', () => {
                    var message: {
                        action: string,
                        name: string,
                        uuid: string,
                        parts: number,
                        location: Array<string>
                    };
                    if (name != location) {
                        this.addFileToDir(folders, upload);
                        message = {
                            action: "uploadFile",
                            name: pushedToUpload,
                            uuid: uuid,
                            parts: partNumber,
                            location: removeItem(folders)
                        };
                    } else {
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
                .on('error', (err: any) => handleAbort(reject, err))
        });
    }

    async sendMessage(contents: string) {
        this.channelCache.send(contents);
    }

    async sendMessageWithAttachment(message: string, file: Buffer, fileName: string) {
        const messageSent = this.channelCache.send({ content: message, files: [{ attachment: file, name: fileName }] });
        return (await messageSent).attachments.first().url;
    }

    addFileToDir(location: Array<string>, file: file) {
        /*
        Steps:
        1. Get the folder it is in
        2. Insert file to list
        3. Add back to list
        */
        if (location[0] == "." || location.length == 0) {
            this.root.addFile(file)
            return;
        }
        this.root.directories = addFileToFolder(this.root.getDirectoryList(), 0, location, file);
        return;
    }

    async createFolder(location: string) {
        if (this.uploadLock.includes(location)) return false;
        if (this.getFolder(location)) return false;
        this.uploadLock.push(location);
        const pushedToUpload: string = location;
        // Extract name from location
        location = location.slice(1);
        let name: string;
        let folders: Array<string>;
        if (location.includes('/')) {
            folders = location.split('/');
            name = folders[folders.length - 1];
            let checkList: string;
            for (var i = 0; i < folders.length - 1; i++) {
                if (i == 0) {
                    checkList = '/' + folders[i];
                } else checkList += '/' + folders[i];
                if (!this.getFolder(checkList)) return false;
            }
        } else {
            name = location;
        }
        console.log(`Creating folder at ${location}`);
        // Create uuid
        const uuid: string = uuidv4();
        // Create directory
        const directoryToAdd: directory = new directory(name, uuid);
        if (name != location) {
            this.addFolderToDir(folders, directoryToAdd);
            await createFolder(uuid, this, pushedToUpload);
        } else {
            this.addFolderToDir(["."], directoryToAdd);
            await createFolder(uuid, this, name);
        }

        return true;
    }

    getFolder(location: string) {
        // Steps:
        // 1. Remove first / tick
        // 2. Split remaining /'es if there are any left tick
        // 3. Check if those directories exist
        // 4. If they do, check if the file exists
        // 5. Upload if it doesn't
        location = location.slice(1);
        if (location.includes('/')) {
            const folders: string[] = location.split('/');
            if (checkIfFolderExists(this.root.getDirectoryList(), 0, folders)) return true;
        }
        for (var i = 0; i <= this.root.directories.length - 1; i++) {
            if (this.root.directories[i].getName() == location) return true;
        }
        return false;
    }

    addFolderToDir(location: Array<string>, folder: directory) {
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

    fileOrFolder(location: string) {
        if (this.getFile(location)) {
            return 0;
        } else if (this.getFolder(location)) {
            return 1;
        }
        return 2;
    }

    getFileForDownload(location: string) {
        location = location.slice(1);
        if (location.includes('/')) {
            const folders: string[] = location.split('/');
            return getExistingFile(this.root.getDirectoryList(), 0, folders);
        } else {
            for (var i = 0; i <= this.root.getFileList().length - 1; i++) {
                if (this.root.getFile(i).getName() == location) return this.root.getFile(i);
            }
        }
    }

    getFilesFromFolderAsString(location: string) {
        if (location == '.') {
            let stringList: Array<string> = [];
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
            const folders: string[] = location.split('/');
            const folderList: directory | false = getExistingFolder(this.root.getDirectoryList(), 0, folders);
            if (folderList === false) {
                return false;
            }
            const dirListToShow: Array<directory> = folderList.getDirectoryList();
            const fileList: Array<file> = folderList.getFileList();
            let stringList: Array<string> = [];
            for (var i = 0; i <= dirListToShow.length - 1; i++) {
                stringList.push(dirListToShow[i].getName());
            }
            for (var i = 0; i <= fileList.length - 1; i++) {
                stringList.push(fileList[i].getName());
            }
            return stringList;
        } else {
            let dirList: directory;
            for (var j = 0; j <= this.root.getDirectoryList().length - 1; j++) {
                if (this.root.getDirectory(j).getName() == location) {
                    dirList = this.root.getDirectory(j);
                }
            }
            const dirListToShow: Array<directory> = dirList.getDirectoryList();
            const fileList: Array<file> = dirList.getFileList();
            let stringList: Array<string> = [];
            for (var i = 0; i <= dirListToShow.length - 1; i++) {
                stringList.push(dirListToShow[i].getName());
            }
            for (var i = 0; i <= fileList.length - 1; i++) {
                stringList.push(fileList[i].getName());
            }
            return stringList;
        }
    }

    async deleteFileOrFolder(location: string) {
        const origLocation: string = location;
        location = location.slice(1);
        if (location.includes('/')) {
            const folders: string[] = location.split('/');
            if (!checkIfFileExists(this.root.directories, 0, folders) || !checkIfFolderExists(this.root.directories, 0, folders)) {
                const delAttempt: directory | false = deleteInFolder(this.root, 0, folders);

                if (delAttempt === false) {
                    return false;
                }

                this.root = delAttempt;
                await this.sendMessage(JSON.stringify({ action: "delete", name: origLocation }));
                return true;
            }
        } else {
            for (var i = 0; i < this.root.directories.length; i++) {
                if (this.root.directories[i].getName() == location) {
                    this.root.directories = deleteFromArray(this.root.directories, i);
                    await this.sendMessage(JSON.stringify({ action: "delete", name: location }));
                    return true;
                }
            }

            for (var i = 0; i < this.root.files.length; i++) {
                if (this.root.files[i].getName() == location) {
                    this.root.files = deleteFromArray(this.root.files, i);
                    await this.sendMessage(JSON.stringify({ action: "delete", name: location }));
                    return true;
                }
            }
        }

        return false;
    }
}