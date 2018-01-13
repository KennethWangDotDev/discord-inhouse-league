import { sortByRatings, sortByRatingsPro } from '../utls/sortByRatings';
import { queryExisting } from '../queries';

/**
 * Command to print out the leaderboard of top players
 * Syntax: !leaderboard
 */
async function leaderboard(msg) {
    const userMessage = msg.content;
    if (
        userMessage.startsWith('!userlist') ||
        userMessage.startsWith('!leaderboard') ||
        userMessage.startsWith('!ranking')
    ) {
        // Fetches info for all players from the database
        const result = await queryExisting('Player', ['username', 'rating']);
        result.sort(sortByRatings);

        // Format message
        let message = '```\n';
        for (const [index, player] of result.entries()) {
            // Limit to top 20 players to avoid chat overflow
            if (index < 20) {
                message += `${index + 1}. ${player.username} - ${player.rating}\n`;
            }
        }
        message += '```';

        // Returns the message to print
        return {
            responseMessage: message,
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default leaderboard;
