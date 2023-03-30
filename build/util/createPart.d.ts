/// <reference types="node" resolution-mode="require"/>
import { filePart } from "../types/filePart.js";
import { discordBot } from "../discordBot.js";
export declare function createPart(partNumber: number, chunkBuffer: Buffer, fileUUID: string, discordBot: discordBot, encryptionKey?: string): Promise<filePart>;
