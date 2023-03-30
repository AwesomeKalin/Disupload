import { filePart } from "../types/filePart.js";
import { v4 as uuidv4 } from 'uuid';
import { encryptBuffer } from "./encryption.js";
export async function createPart(partNumber, chunkBuffer, fileUUID, discordBot, encryptionKey) {
    const uuid = uuidv4();
    const messageContent = { action: "addPart", fileUUID: fileUUID, part: partNumber, partUUID: uuid };
    if (encryptionKey != undefined) {
        chunkBuffer = await encryptBuffer(chunkBuffer, encryptionKey);
    }
    const message = await discordBot.sendMessageWithAttachment(JSON.stringify(messageContent), chunkBuffer, uuid);
    const chunk = new filePart(message, uuid, fileUUID);
    return chunk;
}
