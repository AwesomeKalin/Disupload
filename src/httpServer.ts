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
        this.server = http.createServer(this.requestHandler.bind(this))
        this.server.listen(this.port, () => {
            console.log('HTTP Server listening on ', this.port)
        })
    }

    async requestHandler(req: any, res: any) {
        console.log(`HTTP Request at ${req.url} with method {req.method}`);
    }
}