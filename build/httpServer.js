import * as http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AsyncStreamChunker } from './util/streamChunker.js';
import * as https from 'https';
import { decryptBuffer } from './util/encryption.js';
// The frontend
export class httpServer {
    port;
    bot;
    webPage;
    favicon;
    styleCSS;
    server;
    __dirname;
    error404;
    username;
    password;
    constructor(port, bot, username, password) {
        this.port = port;
        this.bot = bot;
        this.__dirname = path.dirname(fileURLToPath(import.meta.url));
        this.username = username;
        this.password = password;
    }
    // Load the static files
    loadStaticFiles() {
        this.favicon = fs.readFileSync(`${this.__dirname}/../static/favicon.png`);
        this.error404 = fs.readFileSync(`${this.__dirname}/../static/404.html`);
    }
    // Start server
    start() {
        this.loadStaticFiles();
        this.server = http.createServer(this.handleAuth.bind(this));
        this.server.listen(this.port, () => {
            console.log('HTTP Server listening on ', this.port);
        });
    }
    async requestHandler(req, res) {
        console.log(req.method + ': ' + req.url);
        try {
            // Request Favicon
            if (req.url == '/favicon.png' || req.url == '/favicon.ico') {
                res.writeHead(200);
                res.end(this.favicon);
            }
            else if (req.method == 'OPTIONS') {
                // Return on Options method
                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS, DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type, Content-Disposition',
                    'Access-Control-Max-Age': 86400,
                    'Content-Length': 0,
                });
                res.end();
            }
            else if (req.method == 'POST') {
                await this.bot.uploadFile(req.url, req);
                res.writeHead(303, { Connection: 'close', Location: '/', });
                res.end();
            }
            else if (req.method == 'PUT') {
                await this.bot.createFolder(req.url);
                res.writeHead(303, { Connection: 'close', Location: '/', });
                res.end();
            }
            else if (req.method == 'GET' && req.url == '/') {
                const filesInFolder = this.bot.getFilesFromFolderAsString('.');
                const webpage = this.renderWebPage(filesInFolder, '');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(webpage);
            }
            else if (req.method == 'GET') {
                let url;
                if (req.url.charAt(req.url.length - 1) == '/') {
                    url = req.url.slice(0, -1);
                }
                else
                    url = req.url;
                // 0 for file, 1 for dir, 2 for non-existant
                const fileOrFolder = this.bot.fileOrFolder(url);
                if (fileOrFolder == 0) {
                    console.log(`Downloading ${req.url}`);
                    //  Download File
                    const fileToDownload = this.bot.getFileForDownload(url);
                    const partsOfFile = fileToDownload.parts;
                    for (var j = 0; j <= partsOfFile.length - 1; j++) {
                        // Credit to @forscht/ddrive
                        // Typescript-ified and modified to work with my code by AwesomeKalin55
                        await new Promise((resolve, reject) => {
                            https.get(partsOfFile[j].getUrl(), (res2) => {
                                res2.pipe(new AsyncStreamChunker(async (data) => {
                                    if (this.password != undefined) {
                                        data = decryptBuffer(data, this.password);
                                    }
                                    if (!res.write(data))
                                        await new Promise((r) => res.once('drain', r));
                                }));
                                res2.on('error', (err) => reject(err));
                                res2.on('end', () => resolve(''));
                            });
                        });
                        // Credit ends here
                    }
                    console.log(`Download of ${req.url} completed`);
                    res.end();
                }
                else if (fileOrFolder == 1) {
                    // Get list of files and display them
                    const filesInFolder = this.bot.getFilesFromFolderAsString(url);
                    const webpage = this.renderWebPage(filesInFolder, url);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(webpage);
                }
                else {
                    res.writeHead(404);
                    res.end(this.error404);
                }
            }
        }
        catch {
            res.writeHead(404);
            res.end(this.error404);
        }
    }
    renderWebPage(filesInFolder, currentURL) {
        let webpage = '<!DOCTYPE html>\n<html>\n<head>\n<title>Disupload</title>\n</head>\n<body>\n';
        for (var i = 0; i <= filesInFolder.length - 1; i++) {
            webpage += `<a href="${currentURL}/${filesInFolder[i]}">${filesInFolder[i]}</a><br />\n`;
        }
        webpage += '</body>\n</html>';
        return webpage;
    }
    handleAuth(req, res) {
        if (this.username == undefined && this.password == undefined) {
            this.requestHandler(req, res);
        }
        else {
            // By ChatGPT, modified to work with project
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
                const reqUsername = auth[0];
                const reqPassword = auth[1];
                if (reqUsername === this.username && reqPassword === this.password) {
                    this.requestHandler(req, res);
                }
                else {
                    res.statusCode = 401;
                    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
                    res.end('Invalid username or password');
                }
            }
            else {
                res.statusCode = 401;
                res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
                res.end('Authentication required');
            }
            return false;
        }
    }
}