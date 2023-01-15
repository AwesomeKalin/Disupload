import * as http from 'http';
import { discordBot } from './discordBot.js';
import fs from 'fs';

// The frontend
export class httpServer {
    port: number;
    bot: discordBot;
    webPage: string;
    favicon: Buffer;
    styleCSS: string;

    constructor(port: number, bot: discordBot) {
        this.port = port;
        this.bot = bot;
    }

    // Start the server
    start() {
        this.loadWebpageFiles();
    }

    loadWebpageFiles() {
        this.webPage = fs.readFileSync(`${__dirname}/../html/index.html`)
            .toString()
        this.favicon = fs.readFileSync(`${__dirname}/../html/favicon.ico`)
        this.styleCSS = fs.readFileSync(`${__dirname}/../html/style.css`)
            .toString()
    }
}