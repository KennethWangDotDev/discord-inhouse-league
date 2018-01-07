import bot from '../index';

const ongoingDrafts = [];

function formatMessageFromPlayers(title, players) {
    let message = '```\n';
    message += `${title}\n============\n`;
    for (const player of players) {
        message += `${player.Player.username} (${player.Player.rating})\n`;
    }
    message += '```';
    return message;
}

class Draft {
    constructor(captains, remainingPlayers) {
        ongoingDrafts.push(this);
        this.captainsObject = captains;
        this.allPlayers = [...captains, ...remainingPlayers];
        this.teamA = [captains[0]];
        this.teamB = [captains[1]];
        this.remainingPlayers = remainingPlayers;
        this.draftNumber = 1;

        // 1-2-1
        this.draftOrder = {
            1: 'teamB',
            2: 'teamA',
            3: 'teamA',
            4: 'teamB'
        };
        this.startDraft();
    }

    async startDraft() {
        // Initial DMs to both captains
        const captainA = await bot.fetchUser(this.captainsObject[0].discordId);
        const captainB = await bot.fetchUser(this.captainsObject[1].discordId);
        this.captainsClient = {
            teamA: captainA,
            teamB: captainB
        };
        const initialMessage =
            'You have been selected as Captain of your match! The drafting order will be 1-2-1, with the lower ranked Captain drafting first.\n';
        await this.captainsClient.teamA.send(`${initialMessage}\nYou are the *higher ranked* captain, and will be drafting *second*. The other captain is: *${
            this.captainsObject[1].Player.username
        }*.\n${formatMessageFromPlayers('Remaining Players', this.remainingPlayers)}\n`);
        await this.captainsClient.teamB.send(`${initialMessage}\nYou are the *lower ranked* captain, and will be drafting *first*. The other captain is: *${
            this.captainsObject[0].Player.username
        }*.\n${formatMessageFromPlayers('Remaining Players', this.remainingPlayers)}\n`);
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
                    this.remainingPlayers
                )}\nPlease type !draft <player> to draft.`);
            } else {
                await currentCaptainClient.send(`Your turn to draft. Remaining players are:\n${formatMessageFromPlayers(
                    'Remaining Players',
                    this.remainingPlayers
                )}\nPlease type !draft <player> to draft.`);
            }

            await otherCaptainClient.send('Waiting for other captain to draft...');
        } else {
            const endMessage = `Draft complete! The teams are:\n${formatMessageFromPlayers(
                'Team A',
                this.teamA
            )}\n${formatMessageFromPlayers(
                'Team B',
                this.teamB
            )}\n One of the captains should create a lobby and add all players. When the match is finished, please DM me with \`!match report <win | lose>\` to report score.`;
            await this.captainsClient.teamA.send(endMessage);
            await this.captainsClient.teamB.send(endMessage);
        }
    }

    async draftPlayer(username) {
        for (const [index, player] of this.remainingPlayers.entries()) {
            if (player.Player.username === username) {
                this.remainingPlayers.splice(index, 1);
                this[this.currentCaptain].push(player);

                const otherCaptainClient = this.captainsClient[this.otherCaptain];
                otherCaptainClient.send(`The other team has drafted: ${player.Player.username}`);
                this.draftNumber += 1;
                this.nextDraft();
                break;
            }
        }
    }
}

function getOngoingDrafts() {
    return ongoingDrafts;
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

export { Draft, getOngoingDrafts, isCurrentCaptain, getDraftFromDiscordId };
