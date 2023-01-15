import { Client, Events, GatewayIntentBits } from 'discord.js';
import { DirectoryEntry } from './entry/directoryEntry.js';
import * as util from './util.js';
import { File } from './entry/file.js';
import * as _ from 'lodash';

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
        tempMessageCache = tempMessageCache.filter((message) => message.content !== undefined)
        const messagesGroupByType = _.groupBy(tempMessageCache, (message) => message.content.type)
        // Channel is empty
        if (!messagesGroupByType.directory) return
        // Load Directories
        messagesGroupByType.directory.forEach((message) => {
            // Create directory entry
            this.directories.push(new DirectoryEntry(message.content.name, message.id, new Date(message.timestamp).getTime(), message.content.id))
        })

        // Load files
        Object.values(_.groupBy(messagesGroupByType.file, (message) => message.content.fileId))
            .forEach((fileParts) => {
                const [firstPart] = fileParts
                // Create file object
                const file = new File(firstPart.content.name, firstPart.content.directoryId, new Date(firstPart.timestamp).getTime, firstPart.content.fileId)
                fileParts.forEach((filePart) => {
                    const [attachment] = filePart.attachments
                    const entry = new FileEntry({
                        directoryId: filePart.content.directoryId,
                        name: file.name,
                        partNumber: filePart.content.partNumber,
                        size: attachment.size,
                        url: attachment.url,
                        mid: filePart.id,
                    })
                    file.parts.push(entry)
                })
                this.files.push(file)
            })
        debug('>>> DiscordFS load complete')
    }

    getFile(filePath) {
        throw Error ("Not Implemented");
    }
}