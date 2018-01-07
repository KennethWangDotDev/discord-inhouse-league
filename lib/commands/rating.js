import { getPlayerFromUsernameQuery } from '../queries';
import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';

async function rating(msg) {
    const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!rating')) {
        // Action
        if (enforceWordCount(userMessage, 2)) {
            const username = getWord(userMessage, 2);
            const response = await getPlayerFromUsernameQuery(username);
            if (response.Player) {
                return {
                    responseMessage: `User ${username} has a rating of ${response.Player.rating}.`,
                    deleteSenderMessage: false
                };
            }
            // Error - Not found
            return {
                responseMessage: `User ${username} does not exist.`,
                deleteSenderMessage: false
            };
        }

        // Error Syntax
        return {
            responseMessage: 'Syntax error: Make sure to type: !rating <username>',
            deleteSenderMessage: true
        };
    }

    // Resolve promise
    return false;
}

export default rating;
