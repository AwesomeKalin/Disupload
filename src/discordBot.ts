import { Client, Events, GatewayIntentBits, Message } from 'discord.js';
import { directory } from './types/directory.js';
import { file } from './types/file.js';
import { checkIfFileExists, checkIfFolderExists } from './util/checkIfFolderExists.js';
import { v4 as uuidv4 } from 'uuid';
import { createPart } from './util/createPart.js';
import { TextChannel } from 'discord.js';
import { AsyncStreamChunker, StreamChunker } from './util/streamChunker.js';
import { deleteFromArray, deleteSpecificObject, removeItem } from './util/deleteFromArray.js';
import { addFileToFolder, addFolderToFolder } from './util/addFileToFolder.js';
import { createFolder } from './util/createFolder.js';
import { filePart } from './types/filePart.js';

// The Discord Bot
export class discordBot {
    channelId: string;
    token: string;
    channel: any;
    client: Client<boolean>;
    uploadLock: Array<string>;
    channelCache: TextChannel;
    root: directory;

    constructor(channelId: string, token: string) {
        this.channelId = channelId;
        this.token = token;
    }

    // Starts the bot
    async start() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

        this.client.login(this.token);
        this.client.once(Events.ClientReady, c => {
            console.log(`Bot logged in as ${c.user.tag}`);
        });

        this.channelCache = this.client.channels.cache.get(this.channelId) as TextChannel;

        console.log('Loading messages');

        let messagesArray: Array<Message<true>> = [];

        this.channelCache.messages.fetch({ limit: 1 }).then(messages => {
            //Iterate through the messages here with the variable "messages".
            messages.forEach(message => messagesArray.push(message));
        });

        messagesArray = messagesArray.reverse();

        console.log('Parsing messages');
        let partsToAssociate: Array<filePart> = [];

        for (var i = 0; i < messagesArray.length; i++) {
            const messageContents: string = messagesArray[i].content;
            const messageAttachment: string = messagesArray[i].attachments[0].url;
            const messageJson: Object = JSON.parse(messageContents);
            if (messageJson["action"] == "createFolder") {
                let name: string = messageJson["name"];
                const uuid: string = messageJson["folderUUID"];
                let folders: Array<string>;
                if (name.includes('/')) {
                    folders = name.split('/');
                    name = folders[folders.length - 1];
                    const folder: directory = new directory(name, uuid);
                    this.addFolderToDir(folders, folder);
                } else {
                    const folder: directory = new directory(name, uuid);
                    this.addFolderToDir([name], folder);
                }
            } else if (messageJson["action"] == 'addPart') {
                const partToAdd = new filePart(messageAttachment, messageJson["partUUID"], messageJson["fileUUID"]);
                partsToAssociate.push(partToAdd);
            } else if (messageJson["action"] == 'uploadFile') {
                let name: string = messageJson["name"]
                const uuid: string = messageJson["uuid"];
                let folders: Array<string>;
                if (name.includes('/')) {
                    folders = name.split('/');
                    name = folders[folders.length - 1];
                } else {
                    folders = [name];
                }
                let fileToAdd: file = new file(name, uuid);
                for (var i = 0; i < partsToAssociate.length - 1; i++) {
                    if (partsToAssociate[i].fileUUID == uuid) {
                        fileToAdd.addPart(partsToAssociate[i]);
                        partsToAssociate = deleteFromArray(partsToAssociate, i);
                    }
                }
                this.addFileToDir(folders, fileToAdd);
            }
        }
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
            const folders: string[] = location.split('/');
            if (checkIfFileExists(this.root.getDirectoryList(), 0, folders)) return true;
        }
    }

    async uploadFile(location: string, stream: { pipe: (arg0: StreamChunker) => { (): any; new(): any; pipe: { (arg0: AsyncStreamChunker): { (): any; new(): any; on: { (arg0: string, arg1: () => void): { (): any; new(): any; on: { (arg0: string, arg1: (err: any) => Promise<void>): void; new(): any; }; }; new(): any; }; }; new(): any; }; }; }) {
        // Check if file is already being uploaded
        if (this.uploadLock.includes(location)) return false;
        // Check if file exists
        if (!this.getFile(location)) return false;
        this.uploadLock.push(location);
        const pushedToUpload: string = location;
        console.log(`Uploading to ${location}`);
        // Extract name from location
        location = location.slice(1);
        let name: string;
        let folders: Array<string>;
        if (location.includes('/')) {
            folders = location.split('/');
            name = folders[folders.length - 1];
        } else {
            name = location;
        }
        // Create uuid
        const uuid: string = uuidv4();
        // Create file
        let upload: file = new file(name, uuid);
        // Variable to check if upload is aborted
        let aborted: boolean = false;
        // Create chunks
        let partNumber: number = 0;
        const chunkUploader = async (chunk: Buffer) => {
            const entry = await createPart(partNumber, chunk, uuid, this);
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
                        this.addFileToDir(removeItem(folders), upload);
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

    async sendMessageWithAttachment(message: string, file: Buffer) {
        const messageSent = this.channelCache.send({ content: message, files: [file] });
        return (await messageSent).attachments.first().url;
    }

    addFileToDir(location: Array<string>, file: file) {
        /*
        Steps:
        1. Get the folder it is in
        2. Insert file to list
        3. Add back to list
        */
        if (location[0] == ".") {
            this.root.addFile(file)
            return;
        }
        this.root.directories = addFileToFolder(this.root.getDirectoryList(), 0, location, file);
        return;
    }

    async createFolder(location: string) {
        if (this.uploadLock.includes(location)) return false;
        if (!this.getFolder(location)) return false;
        this.uploadLock.push(location);
        const pushedToUpload: string = location;
        console.log(`Uploading to ${location}`);
        // Extract name from location
        location = location.slice(1);
        let name: string;
        let folders: Array<string>;
        if (location.includes('/')) {
            folders = location.split('/');
            name = folders[folders.length - 1];
        } else {
            name = location;
        }
        // Create uuid
        const uuid: string = uuidv4();
        // Create directory
        const directoryToAdd: directory = new directory(name, uuid);
        if (name != location) {
            this.addFolderToDir(removeItem(folders), directoryToAdd);
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
    }

    addFolderToDir(location: Array<string>, folder: directory) {
        /*
        Steps:
        1. Get the folder it is in
        2. Insert file to list
        3. Add back to list
        */
        if (location[0] == ".") {
            this.root.addDirectory(folder);
            return;
        }
        this.root.directories = addFolderToFolder(this.root.getDirectoryList(), 0, location, folder);
        return;
    }
}