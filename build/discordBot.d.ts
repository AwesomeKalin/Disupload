/// <reference types="node" resolution-mode="require"/>
import { Client, TextChannel } from 'discord.js';
import { directory } from './types/directory.js';
import { file } from './types/file.js';
export declare class discordBot {
    channelId: string;
    token: string;
    channel: any;
    client: Client<boolean>;
    uploadLock: Array<string>;
    channelCache: TextChannel;
    root: directory;
    encryptionKey: string;
    constructor(channelId: string, token: string, encryptionKey?: string);
    start(): Promise<void>;
    getFile(location: string): boolean;
    uploadFile(location: string, stream: any): Promise<unknown>;
    sendMessage(contents: string): Promise<void>;
    sendMessageWithAttachment(message: string, file: Buffer, fileName: string): Promise<string>;
    addFileToDir(location: Array<string>, file: file): void;
    createFolder(location: string): Promise<boolean>;
    getFolder(location: string): boolean;
    addFolderToDir(location: Array<string>, folder: directory): void;
    fileOrFolder(location: string): 0 | 1 | 2;
    getFileForDownload(location: string): false | file;
    getFilesFromFolderAsString(location: string): false | string[];
    deleteFileOrFolder(location: string): Promise<boolean>;
}
