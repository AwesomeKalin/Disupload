import { Client, Events, GatewayIntentBits } from 'discord.js';
import Debug from "debug";
const debug = Debug("worker:bot");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, c => {
    debug(`Ready! Logged in as ${c.user.tag}`);
});

export function start(token: string) {
    client.login(token);
}