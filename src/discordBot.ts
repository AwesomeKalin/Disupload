import { Client, Events, GatewayIntentBits } from 'discord.js';

export class discordBot {
    channelId: string;
    token: string;

    constructor(channelId: string, token: string) {
        this.channelId = channelId;
        this.token = token;
    }

   start() {
        const client = new Client({ intents: [GatewayIntentBits.Guilds] });
        client.login(this.token);
        client.once(Events.ClientReady, c => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });
    }
}