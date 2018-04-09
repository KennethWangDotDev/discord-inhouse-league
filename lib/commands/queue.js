import enforceWordCount from '../utls/enforceWordCount';
import queuePop from '../scripts/queuePop';
import { getPlayerFromDiscordIdQuery } from '../queries';
import { getDraftFromDiscordId } from '../scripts/draftClass';
import { logger } from '../';

const queuedPlayers = [];
const queuedPlayersPro = [];

async function queue(msg) {
    const userMessage = msg.content;
    const userID = msg.author.id;
    let player = '';

    // Leaving Queue
    if (userMessage.startsWith('!queue leave')) {
        if (enforceWordCount(userMessage, 2)) {

            // Amateur League Queue
            for (const [index, playerObj] of queuedPlayers.entries()) {
                if (userID === playerObj.discordId) {
                    queuedPlayers.splice(index, 1);
                    logger.log('info', `UserID ${userID} left the Amateur queue.`);
                    return {
                        responseMessage: `A player has left the queue. Players in queue: ${
                            queuedPlayers.length
                        }`,
                        deleteSenderMessage: true
                    };
                }
            }

            // Pro League Queue
            for (const [index, playerObj] of queuedPlayersPro.entries()) {
                if (userID === playerObj.discordId) {
                    queuedPlayersPro.splice(index, 1);
                    logger.log('info', `UserID ${userID} left the Pro queue.`);
                    return {
                        responseMessage: `A player has left the queue. Players in queue: ${
                            queuedPlayersPro.length
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

    // Joining Queue
    if (userMessage.startsWith('!queue join')) {
        if (enforceWordCount(userMessage, 2)) {

            try {
                player = await getPlayerFromDiscordIdQuery(userID);
                if (player === null) {
                    throw 'Error: Unregistered players cannot queue.';
                }
                queuedPlayers.forEach((playerObj) => {
                    if (player.username === playerObj.username) {
                        throw 'Error: Player already in queue.';
                    }
                });
                queuedPlayersPro.forEach((playerObj) => {
                    if (player.username === playerObj.username) {
                        throw 'Error: Player already in queue.';
                    }
                });
                if (getDraftFromDiscordId(userID) !== false) {
                    throw 'Error: Player is in an unreported match. Please finish the match and wait for both captains to report the score.';
                }

                player.discordId = userID;
                if (msg.channel.name.includes('pro')) {
                    queuedPlayersPro.push(player);
                } else {
                    queuedPlayers.push(player);
                }

                // Pop queue
                let queuePopMessage = '';
                if (msg.channel.name.includes('pro')) {
                    logger.log('info', `UserID ${msg.author.id} joined the Pro queue.`);
                    if (queuedPlayersPro.length === 6) {
                        queuePop(queuedPlayersPro, 'pro');
                        queuedPlayersPro.length = 0;
                        logger.log('info', `Amateur queue popped.`);
                        queuePopMessage = ' Beginning Draft.'
                    }
                    return {
                        responseMessage: `A player has joined the queue. Players in queue: ${
                            queuedPlayersPro.length
                        }.${queuePopMessage}`,
                        deleteSenderMessage: true
                    };
                } else {
                    logger.log('info', `UserID ${msg.author.id} joined the Amateur queue.`);
                    if (queuedPlayers.length === 6) {
                        queuePop(queuedPlayers, 'amateur');
                        queuedPlayers.length = 0;
                        logger.log('info', `Amateur queue popped.`);
                        queuePopMessage = ' Beginning Draft.'
                    }
                    return {
                        responseMessage: `A player has joined the queue. Players in queue: ${
                            queuedPlayers.length
                        }.${queuePopMessage}`,
                        deleteSenderMessage: true
                    };
                }
                
            } catch (err) {
                return {
                    responseMessage: err,
                    deleteSenderMessage: false
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
