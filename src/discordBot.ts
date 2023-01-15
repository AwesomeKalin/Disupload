import { Client, Events, GatewayIntentBits } from 'discord.js';

// The Discord Bot
export class discordBot {
    static channelId: string;
    static token: string;

    constructor(channelId: string, token: string) {
        discordBot.channelId = channelId;
        discordBot.token = token;
    }

    // Starts the bot
    static start() {
        const client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.login(this.token);
        client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });
    }
}