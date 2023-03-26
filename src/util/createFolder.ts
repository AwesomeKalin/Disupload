import { discordBot } from "../discordBot.js";

export async function createFolder(folderUUID: string, discordBot: discordBot, name: string) {
    const messageContent: {
        action: string
        folderUUID: string
        name: string;
    } = {action: "createFolder", folderUUID: folderUUID, name: name};
    await discordBot.sendMessage(JSON.stringify(messageContent))
    return true;
}