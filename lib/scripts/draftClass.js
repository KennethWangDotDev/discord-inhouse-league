import bot from '../index';

let index = 0;
const ongoingDrafts = [];

function formatMessageFromPlayers(title, players, league) {
    let message = '```\n';
    message += `${title}\n============\n`;
    for (const player of players) {
        if (league === 'pro') {
            message += `${player.username} (${player.ratingPro})\n`;
        } else {
            message += `${player.username} (${player.rating})\n`;
        }
    }
    message += '```';
    return message;
}

class Draft {
    constructor(captains, remainingPlayers, league) {
        ongoingDrafts.push(this);
        this.index = index;
        index += 1;
        this.league = league;
        this.captainsObject = captains;
        this.allPlayers = [...captains, ...remainingPlayers];
        this.teamA = [captains[0]];
        this.teamB = [captains[1]];
        this.nonCaptains = [...remainingPlayers];
        this.remainingPlayers = remainingPlayers;
        this.draftNumber = 1;
        this.matchInProgress = false;
        this.reportedScores = {};

        // 1-2-1
        this.draftOrder = {
            1: 'teamB',
            2: 'teamA',
            3: 'teamA',
            4: 'teamB'
        };
        if (this.league === 'amateur') {
            this.draftOrder = {
                1: 'teamA',
                2: 'teamB',
                3: 'teamB',
                4: 'teamA'
            };
        }
        this.startDraft();
    }

    async startDraft() {
        // Initial DM to other players
        for (const player of this.nonCaptains) {
            const playerClient = await bot.fetchUser(player.discordId);
            await playerClient.send(`A match has been found, and the captains has started drafting. The captains are: ${
                this.captainsObject[0].username
            } and ${this.captainsObject[1].username}`);
        }
        // Initial DMs to both captains
        const captainA = await bot.fetchUser(this.captainsObject[0].discordId);
        const captainB = await bot.fetchUser(this.captainsObject[1].discordId);
        this.captainsClient = {
            teamA: captainA,
            teamB: captainB
        };
        const initialMessage =
            'You have been selected as Captain of your match! The drafting order will be 1-2-1, with the lower ranked Captain drafting first.\n';
        await this.captainsClient.teamA.send(`${initialMessage}\nYou are the **higher ranked** captain. The other captain is: **${
            this.captainsObject[1].username
        }**.\n${formatMessageFromPlayers(
            'Remaining Players',
            this.remainingPlayers,
            this.league
        )}\n`);
        await this.captainsClient.teamB.send(`${initialMessage}\nYou are the **lower ranked** captain. The other captain is: **${
            this.captainsObject[0].username
        }**.\n${formatMessageFromPlayers(
            'Remaining Players',
            this.remainingPlayers,
            this.league
        )}\n`);
        this.nextDraft();
    }

    async nextDraft() {
        if (this.draftNumber < 5) {
            this.currentCaptain = this.draftOrder[this.draftNumber];
            this.otherCaptain = this.currentCaptain === 'teamA' ? 'teamB' : 'teamA';
            const currentCaptainClient = this.captainsClient[this.currentCaptain];
            const otherCaptainClient = this.captainsClient[this.otherCaptain];

            if (this.draftNumber === 1) {
                await currentCaptainClient.send('You start the draft. Please type !draft <player> to draft.');
            } else if (this.draftNumber === 3) {
                await currentCaptainClient.send(`Your draft again. Remaining players are:\n${formatMessageFromPlayers(
                    'Remaining Players',
                    this.remainingPlayers,
                    this.league
                )}\nPlease type !draft <player> to draft.`);
            } else {
                await currentCaptainClient.send(`Your turn to draft. Remaining players are:\n${formatMessageFromPlayers(
                    'Remaining Players',
                    this.remainingPlayers,
                    this.league
                )}\nPlease type !draft <player> to draft.`);
            }

            await otherCaptainClient.send('Waiting for other captain to draft...');
        } else {
            const endMessage = `Draft complete! The teams are:\n${formatMessageFromPlayers(
                'Team A',
                this.teamA,
                this.league
            )}\n${formatMessageFromPlayers(
                'Team B',
                this.teamB,
                this.league
            )}\nOne of the captains should create a lobby and add all players. When the match is finished, please DM me with \`!match report <win | loss>\` to report score.`;
            await this.captainsClient.teamA.send(endMessage);
            await this.captainsClient.teamB.send(endMessage);
            this.matchInProgress = true;
            for (const player of this.nonCaptains) {
                const playerClient = await bot.fetchUser(player.discordId);
                await playerClient.send(endMessage);
            }
        }
    }

    async draftPlayer(username) {
        for (const [currentIndex, player] of this.remainingPlayers.entries()) {
            if (player.username.toLowerCase() === username.toLowerCase()) {
                this.remainingPlayers.splice(currentIndex, 1);
                this[this.currentCaptain].push(player);
                const otherCaptainClient = this.captainsClient[this.otherCaptain];
                await otherCaptainClient.send(`The other team has drafted: ${player.username}`);
                this.draftNumber += 1;
                this.nextDraft();
                return true;
            }
        }
    }
}

function getOngoingDrafts() {
    return ongoingDrafts;
}

function removeDraft(userDrafIndex) {
    for (const [arrayIndex, draft] of ongoingDrafts.entries()) {
        if (draft.index === Number(userDrafIndex)) {
            ongoingDrafts.splice(arrayIndex, 1);
            return true;
        }
    }
    return false;
}

function isCaptain(discordId) {
    let captain = false;
    for (const draft of ongoingDrafts) {
        if (
            discordId === draft.captainsObject[0].discordId ||
            discordId === draft.captainsObject[1].discordId
        ) {
            captain = true;
        }
    }
    return captain;
}

function isCurrentCaptain(discordId) {
    let captain = false;
    for (const draft of ongoingDrafts) {
        if (discordId === draft.captainsClient[draft.currentCaptain].id) {
            captain = true;
        }
    }
    return captain;
}

function getDraftFromDiscordId(discordId) {
    for (const draft of ongoingDrafts) {
        for (const player of draft.allPlayers) {
            if (discordId === player.discordId) {
                return draft;
            }
        }
    }
    return false;
}

export {
    Draft,
    getOngoingDrafts,
    isCaptain,
    isCurrentCaptain,
    getDraftFromDiscordId,
    formatMessageFromPlayers,
    removeDraft
};
