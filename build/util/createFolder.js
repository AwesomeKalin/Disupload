export async function createFolder(folderUUID, discordBot, name) {
    const messageContent = { action: "createFolder", folderUUID: folderUUID, name: name };
    await discordBot.sendMessage(JSON.stringify(messageContent));
    return true;
}
