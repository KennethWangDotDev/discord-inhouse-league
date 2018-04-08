import { sortByRatings, sortByRatingsPro } from '../utls/sortByRatings';
import { Draft } from '../scripts/draftClass';
import { logger } from '../';

async function queuePop(queue, league) {
    if (queue.length === 6) {
        // Get captains and rest of players
        if (league === 'pro') {
            queue.sort(sortByRatingsPro);
        } else {
            queue.sort(sortByRatings);
        }
        const captains = [queue[0], queue[1]];
        logger.log('info', `Captains are: ${queue[0].username} and ${queue[1].username}`)
        const remainingPlayers = [queue[2], queue[3], queue[4], queue[5]];
        logger.log('info', `Remaining players are: ${queue[2].username}, ${queue[3].username}, ${queue[4].username}, and ${queue[5].username}`);
        new Draft(captains, remainingPlayers, league);
    }
}

export default queuePop;
