import * as http from 'http';
import { discordBot } from './discordBot.js';

// The frontend
export class httpServer {
    port: number;
    bot: discordBot;
    webPage: string;
    favicon: Buffer;
    styleCSS: string;
    server: http.Server;
    __dirname: string;

    constructor(port: number, bot: discordBot) {
        this.port = port;
        this.bot = bot;
    }

    // Start the server
    start() {
        
    }
}