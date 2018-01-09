import sortByRatings from '../utls/sortByRatings';
import { Draft } from '../scripts/draftClass';

async function queuePop(queue) {
    if (queue.length === 6) {
        // Get captains and rest of players
        queue.sort(sortByRatings);
        const captains = [queue[0], queue[1]];
        const remainingPlayers = [queue[2], queue[3], queue[4], queue[5]];
        new Draft(captains, remainingPlayers, 'amateur');
    }
}

export default queuePop;
