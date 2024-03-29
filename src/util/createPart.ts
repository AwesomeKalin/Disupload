import { filePart } from "../types/filePart.js";
import { v4 as uuidv4 } from 'uuid';
import { discordBot } from "../discordBot.js";
import { encryptBuffer } from "./encryption.js";

export async function createPart(partNumber: number, chunkBuffer: Buffer, fileUUID: string, discordBot: discordBot, encryptionKey?: string) {
    const uuid: string = uuidv4();
    const messageContent: {
        action: string
        fileUUID: string;
        part: number;
        partUUID: string;
    } = {action: "addPart", fileUUID: fileUUID, part: partNumber, partUUID: uuid};
    if (encryptionKey != undefined) {
        chunkBuffer = await encryptBuffer(chunkBuffer, encryptionKey);
    }
    const message = await discordBot.sendMessageWithAttachment(JSON.stringify(messageContent), chunkBuffer, uuid);
    const chunk: filePart = new filePart(message, uuid, fileUUID);
    return chunk;
}