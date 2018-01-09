import isAdmin from '../utls/isAdmin';
import { getOngoingDrafts } from '../scripts/draftClass';

/**
 * Command to print out the current version of the bot
 *  Syntax: !listDrafts
 */
function listDrafts(msg) {
    const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!listdraft')) {
        if (isAdmin(msg.author.id)) {
            let message = '```\n';
            for (const draft of getOngoingDrafts()) {
                message += `Index: ${draft.index}\n`;
                message += `League: ${draft.league}\n`;
                message += `In Progress: ${draft.matchInProgress}\n`;
                message += `TeamA: ${draft.teamA[0].username} | ${draft.teamA[1].username} | ${
                    draft.teamA[2].username
                }\n`;
                message += `TeamB: ${draft.teamB[0].username} | ${draft.teamB[1].username} | ${
                    draft.teamB[2].username
                }\n`;
                message += '\n------------------------\n';
            }
            message += '```';
            return {
                responseMessage: message,
                sendToDm: true
            };
        }

        // Error - not admin
        return {
            responseMessage: 'Error - this command is for administrators only.',
            sendToDm: true
        };
    }
}

export default listDrafts;
