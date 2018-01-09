import { version } from '../../package.json';

/**
 * Command to print out the current version of the bot
 *  Syntax: !version
 */
function printVersion(msg) {
    const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!version')) {
        return {
            responseMessage: `Version ${version}`,
            deleteSenderMessage: true
        };
    }
}

export default printVersion;
