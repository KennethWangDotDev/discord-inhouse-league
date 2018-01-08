import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';
import queuePop from '../scripts/queuePop';
import { getPlayerFromDiscordIdQuery } from '../queries';
import { getDraftFromDiscordId } from '../scripts/drafting';

const queuedPlayers = [];

async function queue(msg) {
    const userMessage = msg.content;
    let player = '';

    if (userMessage.startsWith('!queue leave')) {
        // Action
        if (enforceWordCount(userMessage, 2)) {
            const userID = msg.author.id;
            for (const [index, id] of queuedPlayers.entries()) {
                if (userID === id.discordId) {
                    const username = id.Player.username;
                    queuedPlayers.splice(index, 1);
                    return {
                        responseMessage: `${username} has left the queue. Players in queue: ${
                            queuedPlayers.length
                        }`,
                        deleteSenderMessage: false
                    };
                }
            }
            return {
                responseMessage: `${msg.author.username} is not queued.`,
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
        // Action
        if (enforceWordCount(userMessage, 2)) {
            const userID = msg.author.id;

            try {
                player = await getPlayerFromDiscordIdQuery(userID);
                if (player.Player === null) {
                    throw 'Error 1: Unregistered players cannot queue';
                }
                if (player.Player.username !== null) {
                    queuedPlayers.forEach((id) => {
                        if (player.Player.username === id.Player.username) {
                            throw 'Error 2: Player already in queue';
                        }
                    });
                    player.discordId = userID;
                    queuedPlayers.push(player);
                }
                if (getDraftFromDiscordId(userID) !== false) {
                    throw 'Error 3: Player is in an unreported match. Please finish the match and wait for both captains to report the score.';
                }

                // Pop queue
                if (queuedPlayers.length === 2) {
                    queuePop(queuedPlayers);
                    queuedPlayers.splice(0, queuedPlayers.length);
                    return {
                        responseMessage: `${
                            player.Player.username
                        } has joined the queue. Players in queue: 6. Beginning Draft.`,
                        deleteSenderMessage: false
                    };
                }
                return {
                    responseMessage: `${
                        player.Player.username
                    } has joined the queue. Players in queue: ${queuedPlayers.length}.`,
                    deleteSenderMessage: false
                };
            } catch (err) {
                console.log(err);
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
                        responseMessage: `${player.Player.username} is already in queue.`,
                        deleteSenderMessage: false
                    };
                }
            }
        }
        // Syntax error
        return {
            responseMessage: 'Syntax error: To join the queue make sure to type: !queue join',
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default queue;
