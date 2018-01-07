const mockQueue = [
    {
        discordId: 1000,
        username: 'Average',
        rating: 1500
    },
    {
        discordId: 1000,
        username: 'Noob',
        rating: 1400
    },
    {
        discordId: 1000,
        username: 'Pro',
        rating: 1600
    },
    {
        discordId: 1000,
        username: 'God',
        rating: 2000
    },
    {
        discordId: 1000,
        username: 'Noobiest',
        rating: 1000
    },
    {
        discordId: 1000,
        username: 'AverageJoe',
        rating: 1500
    }
];

function compareRating(a, b) {
    if (a.rating > b.rating) {
        return -1;
    }
    if (a.rating < b.rating) {
        return 1;
    }
    return 0;
}

function formatMessageFromPlayers(players) {
    const message = '';
    for (const player of players) {
    }
}

function queuePop(queue) {
    if (queue.length === 6) {
        // Get captains and rest of players
        queue.sort(compareRating);
        const captains = [queue[0], queue[1]];
        const restOfPlayers = [queue[2], queue[3], queue[4], queue[5]];

        // Test print
        console.log(captains);
        console.log(restOfPlayers);
    }
}

queuePop(mockQueue);
