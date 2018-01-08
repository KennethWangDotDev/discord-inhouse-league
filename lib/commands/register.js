import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';
import { createPlayerQuery } from '../queries';

function Player(discordId, username, rating, sigma) {
    this.discordId = discordId;
    this.username = username;
    this.rating = rating;
    this.sigma = sigma;
}

async function addUser(msg) {
    const userMessage = msg.content;
    if (userMessage.startsWith('!register')) {
        // Action
        if (enforceWordCount(userMessage, 2)) {
            const username = getWord(userMessage, 2);
            const userID = msg.author.id;
            const newPlayer = new Player(userID, username, '1500', '1.813');
            try {
                await createPlayerQuery(newPlayer);
            } catch (err) {
                const errStr = err.message.toString();
                if (errStr.includes('Field name = discordId')) {
                    return {
                        responseMessage: `Error: ${userID} has already been registered.`,
                        deleteSenderMessage: false
                    };
                }
                if (errStr.includes('Field name = username')) {
                    return {
                        responseMessage: `Error: ${username} has already been registered.`,
                        deleteSenderMessage: false
                    };
                }
            }
            return {
                responseMessage: `${userID} has been successfully registered as ${username}.`,
                deleteSenderMessage: false
            };
        }

        // Error - Syntax
        return {
            responseMessage:
                'Syntax error: did NOT register player. Make sure to type: !register <YourUsername>.',
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default addUser;
