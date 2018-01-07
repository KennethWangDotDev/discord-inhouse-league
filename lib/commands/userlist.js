import sortByRatings from '../utls/sortByRatings';
import { queryExisting } from '../queries';

async function userlist(msg) {
    const userMessage = msg.content.toLowerCase();
    if (
        userMessage.startsWith('!userlist') ||
        userMessage.startsWith('!leaderboard') ||
        userMessage.startsWith('!ranking')
    ) {
        // Action
        let message = '';
        const result = await queryExisting('Player', ['username', 'rating']);
        result.sort(sortByRatings);
        for (const [index, player] of result.entries()) {
            message += `${index + 1}.${player.username}-${player.rating}\n`;
        }
        return {
            responseMessage: message,
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default userlist;
