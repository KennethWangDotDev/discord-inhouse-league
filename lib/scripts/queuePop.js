import sortByRatings from '../utls/sortByRatings';

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

class Draft {
    constructor(captains, remainingPlayers) {
        this.teamA = [captains[0]];
        this.teamB = [captains[1]];
        this.remainingPlayers = remainingPlayers;
        this.draftNumber = 1;

        // 1-2-1
        this.draftOrder = {
            1: 'teamA',
            2: 'teamB',
            3: 'teamB',
            4: 'teamA'
        };

        startDraft() {
            
        }
    }


  }

function formatMessageFromPlayers(title, players) {
    let message = '```\n';
    message += `${title}\n============\n`;
    for (const player of players) {
        message += `${player.username} (${player.rating})\n`;
    }
    message += '```';
    return message;
}

function queuePop(queue) {
    if (queue.length === 6) {
        // Get captains and rest of players
        queue.sort(sortByRatings);
        const captains = [queue[0], queue[1]];
        const remainingPlayers = [queue[2], queue[3], queue[4], queue[5]];

        // Test print
        console.log(captains);
        console.log(remainingPlayers);

        console.log(formatMessageFromPlayers('Remaining Players', remainingPlayers));
    }
}

queuePop(mockQueue);
