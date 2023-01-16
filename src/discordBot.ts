import { Client, Events, GatewayIntentBits } from 'discord.js';

// The Discord Bot
export class discordBot {
    channelId: string;
    token: string;
    channel: any;
    client: Client<boolean>;
    directories: Array<any>;

    constructor(channelId: string, token: string) {
        this.channelId = channelId;
        this.token = token;
    }

    // Starts the bot
    async start() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

        this.client.login(this.token);
        this.client.once(Events.ClientReady, c => {
            console.log(`Bot logged in as ${c.user.tag}`);
        });

        console.log('Loading messages');
    }
}