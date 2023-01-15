import { Client, Events, GatewayIntentBits } from 'discord.js';

// The Discord Bot
export class discordBot {
    channelId: string;
    token: string;

    constructor(channelId: string, token: string) {
        this.channelId = channelId;
        this.token = token;
    }

    // Starts the bot
    start() {
        const client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.login(this.token);
        client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });
    }
}