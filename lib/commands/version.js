import { version } from '../../package.json';

function version(msg) {
    const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!version')) {
        return {
            responseMessage: `Version ${version}`,
            deleteSenderMessage: true
        };
    }
}

export default version;
