import { version } from '../../package.json';

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
