import * as http from 'http';
import { discordBot } from './discordBot.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The frontend
export class httpServer {
    port: number;
    bot: discordBot;
    webPage: string;
    favicon: Buffer;
    styleCSS: string;
    server: http.Server;
    __dirname: string;
    error404: Buffer;

    constructor(port: number, bot: discordBot) {
        this.port = port;
        this.bot = bot;
        this.__dirname = path.dirname(fileURLToPath(import.meta.url));
    }

    // Load the static files

    loadStaticFiles() {
        this.favicon = fs.readFileSync(`${this.__dirname}/../static/favicon.png`);
        this.error404 = fs.readFileSync(`${this.__dirname}/../static/404.html`);
    }

    // Start server

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
            // Request Favicon

            if(req.url === '/favicon.png') {
                res.writeHead(200);
                res.end(this.favicon);
            } else if (req.method === 'OPTIONS') {
                // Return on Options method
                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS, DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type, Content-Disposition',
                    'Access-Control-Max-Age': 86400,
                    'Content-Length': 0,
                })
                res.end()
            } else if (req.method === 'UPLOAD') {
                await this.bot.uploadFile(req.url, req);
                res.writeHead(303, {Connection: 'close', Location: '/'});
                res.end();
            } else if (req.method === 'FOLDER') {
                await this.bot.createFolder(req.url);
                res.writeHead(303, {Connection: 'close', Location: '/'});
                res.end();
            }
        } catch {
            res.writeHead(404);
            res.end(this.error404);
        }
    }
}