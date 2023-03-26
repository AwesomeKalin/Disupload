import * as http from 'http';
import { discordBot } from './discordBot.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { file } from './types/file.js';
import { filePart } from './types/filePart.js';
import { AsyncStreamChunker, StreamChunker } from './util/streamChunker.js';

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

            if (req.url === '/favicon.png') {
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
                res.writeHead(303, { Connection: 'close', Location: '/' });
                res.end();
            } else if (req.method === 'FOLDER') {
                await this.bot.createFolder(req.url);
                res.writeHead(303, { Connection: 'close', Location: '/' });
                res.end();
            } else if (req.method === 'GET') {
                // 0 for file, 1 for dir, 2 for non-existant
                const fileOrFolder: number = this.bot.fileOrFolder(req.url);

                if (fileOrFolder == 0) {
                    console.log(`Downloading ${req.url}`);
                    //  Download File
                    //@ts-expect-error
                    const fileToDownload: file = this.bot.getFileForDownload(req.url);
                    const partsOfFile: Array<filePart> = fileToDownload.getPartsList();
                    for (var j = 0; j < partsOfFile.length - 1; j++) {
                        // Credit to @forscht/ddrive
                        // Typescript-ified and modified to work with my code by AwesomeKalin55
                        await new Promise((resolve, reject) => {
                            http.get(partsOfFile[j].getUrl(), (res2) => {
                                res.pipe(new AsyncStreamChunker(async (data) => {
                                    if (!res.write(data)) await new Promise((r) => res.once('drain', r));
                                }))
                                res2.on('error', (err) => reject(err));
                                res2.on('end', () => resolve(''));
                            });
                        });
                    }
                    console.log(`Download of ${req.url} completed`);
                    res.end();
                } else if (fileOrFolder == 1) {
                    // Get list of files and display them
                    const filesInFolder: Array<string> = this.bot.getFilesFromFolderAsString(req.url);
                    const webpage: string = this.renderWebPage(filesInFolder, req.url);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(webpage);
                } else {
                    res.writeHead(404);
                    res.end('Error 404. Page or file not found');
                }
            }
        } catch {
            res.writeHead(404);
            res.end(this.error404);
        }
    }

    renderWebPage(filesInFolder: Array<string>, currentURL: string) {
        let webpage: string = '<!DOCTYPE html>\n<html>\n<head>\n<title>Disupload</title>\n</head>\n<body>\n';
        for (var i = 0; i < filesInFolder.length - 1; i++) {
            webpage += `<a href="${currentURL}/${filesInFolder[i]}">${filesInFolder[i]}</a>\n`
        }
        webpage += '</body>\n</html>';
        return webpage;
    }
}