import { isCurrentCaptain, getDraftFromDiscordId } from '../scripts/draftClass';
import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';

async function draft(msg) {
    const userMessage = msg.content;
    if (userMessage.startsWith('!draft')) {
        // Action
        if (enforceWordCount(userMessage, 2)) {
            if (isCurrentCaptain(msg.author.id)) {
                const username = getWord(userMessage, 2);
                const currentDraft = getDraftFromDiscordId(msg.author.id);
                for (const player of currentDraft.remainingPlayers) {
                    if (player.username.toLowerCase() === username.toLowerCase()) {
                        await currentDraft.draftPlayer(username);
                        return {
                            responseMessage: `Succesfully drafted ${username} to your team!`,
                            sendToDm: true
                        };
                    }
                }

                // Error - no matching username
                return {
                    responseMessage: `Error: cannot find player ${username} in remaining players.`,
                    sendToDm: true
                };
            }
            // Error - not captain
            return {
                responseMessage:
                    'Error: you are not a captain for any ongoing matches, or it is not your turn to draft.',
                sendToDm: true
            };
        }

        // Error - Syntax
        return {
            responseMessage:
                'Syntax error: did NOT draft player. Make sure to type: !draft <username>.',
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default draft;
