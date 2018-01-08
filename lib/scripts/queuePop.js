// import sortByRatings from '../utls/sortByRatings';
import { Draft } from '../scripts/drafting';

function sortByRatings(a, b) {
    if (a.Player.rating > b.Player.rating) {
        return -1;
    }
    if (a.Player.rating < b.Player.rating) {
        return 1;
    }
    return 0;
}

async function queuePop(queue) {
    if (queue.length === 6) {
        // Get captains and rest of players
        queue.sort(sortByRatings);
        const captains = [queue[0], queue[1]];
        const remainingPlayers = [queue[2], queue[3], queue[4], queue[5]];
        console.log(captains[0]);
        console.log(captains[1]);

        new Draft(captains, remainingPlayers);
    }
}

export default queuePop;
