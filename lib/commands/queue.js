import enforceWordCount from '../utls/enforceWordCount';
import queuePop from '../scripts/queuePop';
import { getPlayerFromDiscordIdQuery } from '../queries';
import { getDraftFromDiscordId } from '../scripts/draftClass';

const queuedPlayers = [];

async function queue(msg) {
    const userMessage = msg.content;
    let player = '';

    if (userMessage.startsWith('!queue leave')) {
        if (enforceWordCount(userMessage, 2)) {
            const userID = msg.author.id;
            for (const [index, playerObj] of queuedPlayers.entries()) {
                if (userID === playerObj.discordId) {
                    queuedPlayers.splice(index, 1);
                    return {
                        responseMessage: `A player has left the queue. Players in queue: ${
                            queuedPlayers.length
                        }`,
                        deleteSenderMessage: true
                    };
                }
            }

            // Error - not in queue
            return {
                responseMessage: `Error - ${msg.author.username} is not in queue.`,
                deleteSenderMessage: false
            };
        }

        // Syntax error
        return {
            responseMessage: 'Syntax error: To leave the queue make sure to type: !queue leave',
            deleteSenderMessage: false
        };
    }

    if (userMessage.startsWith('!queue join')) {
        if (enforceWordCount(userMessage, 2)) {
            const userID = msg.author.id;

            try {
                player = await getPlayerFromDiscordIdQuery(userID);
                if (player === null) {
                    throw 'Error 1: Unregistered players cannot queue';
                }
                if (player.username !== null) {
                    queuedPlayers.forEach((playerObj) => {
                        if (player.username === playerObj.username) {
                            throw 'Error 2: Player already in queue';
                        }
                    });
                    if (getDraftFromDiscordId(userID) !== false) {
                        throw 'Error 3: Player is in an unreported match. Please finish the match and wait for both captains to report the score.';
                    }
                    player.discordId = userID;
                    queuedPlayers.push(player);
                }

                // Pop queue
                if (queuedPlayers.length === 6) {
                    queuePop(queuedPlayers);
                    queuedPlayers.length = 0;
                    return {
                        responseMessage:
                            'A player has joined the queue. Players in queue: 6. Beginning Draft.',
                        deleteSenderMessage: true
                    };
                }
                return {
                    responseMessage: `A player has joined the queue. Players in queue: ${
                        queuedPlayers.length
                    }.`,
                    deleteSenderMessage: true
                };
            } catch (err) {
                if (err.includes('Error 1:')) {
                    return {
                        responseMessage: `Error: ${
                            msg.author.username
                        } has not registered a username and cannot queue.`,
                        deleteSenderMessage: false
                    };
                }
                if (err.includes('Error 2:')) {
                    // console.log(msg.author.username);
                    return {
                        responseMessage: 'Player is already in queue.',
                        deleteSenderMessage: true
                    };
                }
                if (err.includes('Error 3:')) {
                    return {
                        responseMessage: `Player ${
                            player.username
                        } is in an unreported match. Please finish the match and wait for both captains to report the score.`,
                        deleteSenderMessage: false
                    };
                }
            }
        }

        // Syntax error
        return {
            responseMessage:
                'Syntax error: To join the queue make sure to type: !queue join or !queue leave',
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default queue;
