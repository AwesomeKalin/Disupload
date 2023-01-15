#!/usr/bin/env node

import {httpServer} from './httpServer.js';
import {discordBot} from './discordBot.js';
import yargs from 'yargs/yargs';

// Cli arguments
const argv = yargs(process.argv.slice(2)).options({
  token: { type: 'string', demandOption: true, describe: "The Discord Bot Token" },
  channelId: { type: 'string', demandOption: true, describe: "The channel that will store everything" },
  port: { type: 'number', describe: "The port the HTTP server runs on. Defaults to 8080", default: 8080 }
}).parseSync();

const bot = new discordBot(argv.channelId, argv.token);
// Start the bot
bot.start();
const server = new httpServer(argv.port, bot);
server.start();