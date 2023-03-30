/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import * as http from 'http';
import { discordBot } from './discordBot.js';
export declare class httpServer {
    port: number;
    bot: discordBot;
    webPage: string;
    favicon: Buffer;
    styleCSS: string;
    server: http.Server;
    __dirname: string;
    error404: Buffer;
    username: string;
    password: string;
    constructor(port: number, bot: discordBot, username?: string, password?: string);
    loadStaticFiles(): void;
    start(): void;
    requestHandler(req: any, res: any): Promise<void>;
    renderWebPage(filesInFolder: Array<string>, currentURL: string): string;
    handleAuth(req: {
        headers: {
            authorization: any;
        };
    }, res: {
        statusCode: number;
        setHeader: (arg0: string, arg1: string) => void;
        end: (arg0: string) => void;
    }): boolean;
}
