import { Client, Events, GatewayIntentBits } from 'discord.js';
import { directory } from './types/directory.js';
import { checkIfFolderExists } from './util/checkIfFolderExists.js';

// The Discord Bot
export class discordBot {
    channelId: string;
    token: string;
    channel: any;
    client: Client<boolean>;
    directories: Array<directory>;

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

    getFile(location: string) {
        // Steps:
        // 1. Remove first / tick
        // 2. Split remaining /'es if there are any left tick
        // 3. Check if those directories exist
        // 4. If they do, check if the file exists
        // 5. Upload if it doesn't
        location = location.slice(1);
        if(location.includes('/')) {
            const folders: string[] = location.split('/');
            if (checkIfFolderExists(this.directories, 0, folders)) return true;
        }
    }

    async uploadFile(location: string, stream) {
        console.log(`Uploading to ${location}`);

    }
}