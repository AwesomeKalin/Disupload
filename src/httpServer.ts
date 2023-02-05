import * as http from 'http';
import { discordBot } from './discordBot.js';
import fs from 'fs';
import path from 'path';

// The frontend
export class httpServer {
    port: number;
    bot: discordBot;
    webPage: string;
    favicon: Buffer;
    styleCSS: string;
    server: http.Server;
    __dirname;

    constructor(port: number, bot: discordBot) {
        this.port = port;
        this.bot = bot;
        const moduleURL = new URL(import.meta.url);
        this.__dirname = path.dirname(moduleURL.pathname);
    }

    // Start the server

    loadStaticFiles() {
        this.favicon = fs.readFileSync(`${this.__dirname}/../static/favicon.png`);
    }

    start() {
        this.loadStaticFiles();
        this.server = http.createServer(this.requestHandler.bind(this))
        this.server.listen(this.port, () => {
            console.log('HTTP Server listening on ', this.port)
        })
    }

    async requestHandler(req: any, res: any) {
        console.log(req.method + ': ' + req.url);

        try {
            if(req.url === '/favicon.png') {
                res.writeHead(200);
                res.end(this.favicon);
            } else if (req.method === 'OPTIONS') {
                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS, DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type, Content-Disposition',
                    'Access-Control-Max-Age': 86400,
                    'Content-Length': 0,
                })
                res.end()
            }
        } catch {

        }
    }
}