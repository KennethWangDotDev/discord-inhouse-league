import sortByRatings from '../utls/sortByRatings';
import { Draft } from '../scripts/drafting';

const mockQueue = [
    {
        Player: {
            username: 'Average',
            rating: 1500
        },
        discordId: 1000
    },
    {
        Player: {
            username: 'Noob',
            rating: 1400
        },
        discordId: 1000
    },
    {
        Player: {
            username: 'God',
            rating: 1900
        },
        discordId: 1000
    },
    {
        Player: {
            username: 'Pro',
            rating: 1700
        },
        discordId: 1000
    },
    {
        Player: {
            username: 'SuperNoob',
            rating: 1000
        },
        discordId: 1000
    }
];

async function queuePop(queue) {
    if (queue.length === 2) {
        // Get captains and rest of players
        queue.sort(sortByRatings);
        const captains = [queue[0], queue[1]];
        const remainingPlayers = [mockQueue[0], mockQueue[2], mockQueue[3], mockQueue[4]];

        new Draft(captains, remainingPlayers);
    }
}

export default queuePop;
