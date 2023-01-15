import * as http from 'http';
import { discordBot } from './discordBot.js';
import * as fs from 'fs';
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

    constructor(port: number, bot: discordBot) {
        this.port = port;
        this.bot = bot;
    }

    // Start the server
    start() {
        this.__dirname = path.dirname(fileURLToPath(import.meta.url));
        console.log(this.__dirname);
        this.loadWebpageFiles();
        this.server = http.createServer(this.requestHandler.bind(this))
        this.server.listen(this.port, () => {
            console.log('http server listening on => ', this.port)
        })
    }

    loadWebpageFiles() {
        this.webPage = fs.readFileSync(`${this.__dirname}/../html/index.html`)
            .toString()
        this.favicon = fs.readFileSync(`${this.__dirname}/../html/favicon.ico`)
        this.styleCSS = fs.readFileSync(`${this.__dirname}/../html/style.css`)
            .toString()
    }

    async requestHandler(req, res) {
        // Log request
        console.log(`${req.method}${req.url}`)

        // Decode URL
        const decodedURL = decodeURI(req.url)

        // Get All Resources
        try {
            if (req.url === '/favicon.ico') {
                res.writeHead(200)
                res.end(this.favicon)
            } else if (req.url === '/style.css') {
                res.writeHead(200)
                res.end(this.styleCSS)
            } else if (req.method === 'OPTIONS') {
                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS, DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type, Content-Disposition',
                    'Access-Control-Max-Age': 86400,
                    'Content-Length': 0,
                })
                res.end()
            } /*else if (req.method === 'DELETE') {
                await this.deleteResourceHandler(req, res)
            } else if (req.method === 'PURGE') {
                await this.discordFS.rmdir(req.url)
                res.writeHead(200)
                res.end()
            } else if (req.method === 'POST') {
                await this.discordFS.createFile(decodedURL, req)
                res.writeHead(303, {
                    Connection: 'close',
                    Location: '/',
                })
                res.end()
            } else if (req.method === 'GET' && decodedURL.startsWith('/metadata') && this.metadata) {
                const data = {
                    files: this.discordFS.files,
                    directories: this.discordFS.directories,
                }
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify(data))
            } else if (req.method === 'PUT') {
                await this.discordFS.mkdir(decodedURL)
                res.writeHead(303, {
                    Connection: 'close',
                    Location: '/',
                })
                res.end()
            } else if (req.method === 'GET' && decodedURL.startsWith('/find/')) {
                const entries = this.discordFS.find(path.basename(decodedURL))
                const webpage = this.renderWeb(entries, `/${path.basename(decodedURL)}`, true)
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(webpage)
            } else if (req.method === 'GET') {
                const file = this.discordFS.getFile(decodedURL)
                const directory = this.discordFS.getDirectory(decodedURL)
                if (file) {
                    const { range } = req.headers
                    const parsedRange = Util.rangeParser(file.size, range, { chunkSize: 40 ** 6 })
                    if (range && parsedRange !== -1) {
                        const { start, end } = parsedRange
                        res.writeHead(206, {
                            'Content-Length': end - start + 1,
                            'Content-Range': `bytes ${start}-${end}/${file.size}`,
                            'Accept-Ranges': 'bytes',
                        })
                        await file.download(res, start, end)
                    } else {
                        res.writeHead(200, {
                            'Content-Length': file.size,
                            'Accept-Ranges': 'bytes',
                        })
                        await file.download(res)
                    }
                } else if (directory) {
                    const entries = this.discordFS.list(decodedURL)
                    const webpage = this.renderWeb(entries, decodedURL)
                    res.writeHead(200, { 'Content-Type': 'text/html' })
                    res.end(webpage)
                } else if (req.url === '/') {
                    const webpage = this.renderWeb([], decodedURL)
                    res.writeHead(200, { 'Content-Type': 'text/html' })
                    res.end(webpage)
                } else {
                    res.writeHead(404)
                    res.end('not found')
                }
            } */else {
                res.writeHead(404)
                res.end('not found')
            }
        } catch (err) {
            return;
            /*Util.errorPrint(err, {
                method: req.method,
                url: decodedURL,
            })
            if (err.code) {
                res.writeHead(409)
                res.end(err.message)
            } else {
                res.writeHead(500)
                res.end('Internal server error')
            }*/
        }
    }
}