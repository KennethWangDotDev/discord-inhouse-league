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
    const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!register')) {
        // Action
        if (enforceWordCount(userMessage, 2)) {
            const username = getWord(userMessage, 2);
            const userID = msg.author.id;
            const newPlayer = new Player(userID, username, '1500', '1.813');
            await createPlayerQuery(newPlayer);
            return {
                responseMessage: `${userID} has been successfully registered as ${username}.`,
                deleteSenderMessage: false
            };
        }

        // Error - Syntax
        return {
            responseMessage:
                'Syntax error: did NOT register player. Make sure to type: !ihl user register <YourUsername>.',
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default addUser;
