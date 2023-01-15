#!/usr/bin/env node

import * as HTTPServer from './http-server.js';
import * as DiscordBot from './discord-bot.js';
import yargs from 'yargs/yargs';

const argv = yargs(process.argv.slice(2)).options({
    token: {type: 'string', demandOption: true, describe: "The Discord Bot Token"}
  }).parseSync();

DiscordBot.start(argv.token);