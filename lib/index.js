import Discord from 'discord.js';
import cfg from '../config';
import * as commands from './commands';

/* ==========================================
*  Bot Initialization
/* ========================================== */
let server;
const cmdChannels = [];

const bot = new Discord.Client();

bot.login(cfg.discordToken).then(() => console.log('Bot logged in succesfully!'));
bot.on('ready', () => {
    console.log('Initializing starting variables...');

    // Server setup...
    server = bot.guilds.find('name', cfg.server[cfg.environment]);
    if (!server) {
        console.error(`Server ${cfg.serverName} not found.`);
        process.exit(-1);
    }

    // Channels setup...
    for (const channel of cfg.cmdChannels[cfg.environment]) {
        const foundChannel = server.channels.find('name', channel);
        if (!foundChannel) {
            console.error(`Channel ${channel} not found.`);
            process.exit(-1);
        } else {
            cmdChannels.push(foundChannel);
        }
    }

    console.log(`Ready! Serving for a total of ${bot.users.size} users!`);
});

/* ==========================================
*  Message parsing
/* ========================================== */

bot.on('message', async (msg) => {
    let finalMessageObj;
    if ((cmdChannels.includes(msg.channel) || msg.channel.type === 'dm') && !msg.author.bot) {
        // Traverse through commands list
        for (const key in commands) {
            if (commands.hasOwnProperty(key)) {
                const response = await commands[key](msg);
                if (response) {
                    finalMessageObj = response;
                }
            }
        }

        // Response to command
        if (finalMessageObj && finalMessageObj.responseMessage) {
            if (msg.channel.type === 'dm' || finalMessageObj.sendToDm) {
                // Direct message
                msg.author.send(finalMessageObj.responseMessage).catch(console.error);
            } else {
                // Channel message
                msg.channel.send(finalMessageObj.responseMessage).catch(console.error);
                if (finalMessageObj.deleteSenderMessage) {
                    msg.delete(0);
                }
            }
        }
    }
});

export default bot;
