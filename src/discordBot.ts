import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as util from './util.js';

// The Discord Bot
export class discordBot {
    channelId: string;
    token: string;
    channel: any;
    client: Client<boolean>

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

        this.channel = this.client.channels.cache.get(this.channelId)
        let tempMessageCache: Array<any> = []
        let channelMessages: any = await this.channel.fetch({ limit: 100 }).then(async () => {
            while (channelMessages.length > 0) { }
            tempMessageCache.push(...channelMessages
                .map((message) => ({
                    ...message,
                    content: util.safeParse(message.content),
                })));
            // Get next 100 messages
            // eslint-disable-next-line no-await-in-loop
            channelMessages = await this.channel.fetch(
                {
                    limit: 100,
                    before: tempMessageCache[tempMessageCache.length - 1].id,
                },
            )
        });
    }

    getFile(filePath) {
        throw Error ("Not Implemented");
    }
}