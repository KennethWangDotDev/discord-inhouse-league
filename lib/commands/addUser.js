import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';
import { createPlayerQuery } from '../queries/index.js';

function Player(discordId, username, rating, sigma) {
	this.discordId = discordId;
	this.username = username;
	this.rating = rating;
	this.sigma = sigma;
}

function addUser(msg) {
	const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!ihl user register')) {
        if (enforceWordCount(userMessage, 4)) {
            const username = getWord(userMessage, 4);
			const userID = msg.author.id;
			let newPlayer = new Player(userID, username, "1500", "1.813");
			createPlayerQuery(newPlayer);
			process.on('unhandledRejection', (reason, p) => {
				console.log('unhandled rejection :', reason);
				return {
					responseMessage: `Error: ${userID} has already been registered.`,
					deleteSenderMessage: false
				};		
			});
            return {
                responseMessage: `${userID} has been successfully registered as ${username}.`,
                deleteSenderMessage: false
            };
        }
        // Syntax error
        return {
            responseMessage:
                'Syntax error: did NOT register player. Make sure to type: !ihl user register <YourUsername>.',
            deleteSenderMessage: false
        };
    }
}

export default addUser;