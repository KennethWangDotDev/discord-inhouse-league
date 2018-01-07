import Discord from 'discord.js';
import dedent from 'dedent-js';
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
    for (const channel of cfg.cmdChannels) {
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
*  Helper Functions
/* ========================================== */

/**
 * Helper function to check whether specified user is an administrator.
 * @param  {string}  userID - Discord ID of user.
 * @return {Boolean} - Returns true if the specified user is an administrator.
 *                     Otherwise returns false.
 */
function isAdmin(userID) {
    for (const admin of cfg.admins) {
        if (userID === admin) {
            return true;
        }
    }
    return false;
}

/* ==========================================
*  Message parsing
/* ========================================== */

bot.on('message', async (msg) => {
    let responseMessage;
    let deleteSenderMessage;
    if (cmdChannels.includes(msg.channel)) {
        // Traverse through commands list
        for (const key in commands) {
            if (commands.hasOwnProperty(key)) {
				const response = await commands[key](msg);
				if (response) {
					({ responseMessage, deleteSenderMessage } = response);
				}
            }
        }

        // Response to command
        if (responseMessage) {
            msg.channel.send(responseMessage).catch(console.error);
        }
        if (deleteSenderMessage) {
            msg.delete(0);
        }
    }
});
