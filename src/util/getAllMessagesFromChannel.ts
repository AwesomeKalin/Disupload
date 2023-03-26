// By ChatGPT

import { TextChannel, Collection, Snowflake } from "discord.js";

export async function getAllMessages(channel: TextChannel, before?: Snowflake): Promise<Array<any>> {
    const messages = await channel.messages.fetch({ limit: 100, before: before });
    const messagesArray = Array.from(messages.values());
    if (messages.size === 100) {
        const olderMessages = await getAllMessages(channel, messagesArray[messagesArray.length - 1].id);
        return messagesArray.concat(olderMessages);
    } else {
        return messagesArray;
    }
}