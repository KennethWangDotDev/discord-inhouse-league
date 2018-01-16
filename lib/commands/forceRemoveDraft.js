import isAdmin from '../utls/isAdmin';
import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';
import { getOngoingDrafts, removeDraft } from '../scripts/draftClass';

/**
 * Command to print out the current version of the bot
 *  Syntax: !removeDraft
 */
function forceRemoveDraft(msg) {
    const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!removedraft')) {
        if (isAdmin(msg.author.id)) {
            if (enforceWordCount(userMessage, 2)) {
                const arrayIndex = Number(getWord(userMessage, 2));
                if (!isNaN(arrayIndex)) {
                    if (arrayIndex < getOngoingDrafts().length) {
                        removeDraft(arrayIndex);
                        return {
                            responseMessage: 'Draft should be removed.',
                            sendToDm: true
                        };
                    }
                    // Error - No matching index
                    return {
                        responseMessage: 'Error - no matching index',
                        sendToDm: true
                    };
                }
                // Error - Not a number
                return {
                    responseMessage: `Error - ${arrayIndex} must be a number.`,
                    sendToDm: true
                };
            }

            // Error - Syntax
            return {
                responseMessage: 'Error - Please use !removedraft <index>',
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

export default forceRemoveDraft;
