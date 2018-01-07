import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';

function addUser(msg) {
    const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!ihl register')) {
        if (enforceWordCount(userMessage, 3)) {
            const username = getWord(userMessage, 3);
            return {
                responseMessage: `${username}`,
                deleteSenderMessage: false
            };
        }
        // Syntax error
        return {
            responseMessage:
                'Syntax error: did NOT register player. Make sure to type: !ihl register <YourUsername>.',
            deleteSenderMessage: false
        };
    }
}

export default addUser;
