import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';
import { queryExisting } from '../queries/index.js';

async function listUsers(userMessage) {
    if (userMessage.startsWith('!ihl user list')) {
        if (enforceWordCount(userMessage, 3)) {
			let message = '';
			var count = 0;
			const result = await queryExisting('Player', ['username', 'rating']);
			result.sort(compare);
			
			result.forEach( function (player) {
				message += count + '. ' + player.username + ' - ' + player.rating + '\n';
				count += 1;
			});
			
			//Debug print
			console.log(message);
			return {
                responseMessage: `${message}`,
                deleteSenderMessage: false
            };
        }
        // Syntax error
        return {
            responseMessage:
                'Syntax error: Make sure to type: !ihl user list',
            deleteSenderMessage: false
        };
    }
}

function compare(a,b) {
  if (a.rating > b.rating)
    return -1;
  if (a.rating < b.rating)
    return 1;
  return 0;
}

export default listUsers;
