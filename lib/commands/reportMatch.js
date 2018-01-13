import {
    isCaptain,
    getDraftFromDiscordId,
    formatMessageFromPlayers,
    removeDraft
} from '../scripts/draftClass';
import updatePlayerRatings from '../scripts/updatePlayerRatings';
import recordMatch from '../scripts/recordMatch';
import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';
import bot from '../index';

async function reportMatch(msg) {
    const userMessage = msg.content;
    if (userMessage.startsWith('!match report')) {
        // Action
        if (enforceWordCount(userMessage, 3)) {
            if (isCaptain(msg.author.id)) {
                const currentDraft = getDraftFromDiscordId(msg.author.id);
                if (currentDraft.matchInProgress) {
                    const winOrLoss = getWord(userMessage, 3);
                    let currentTeam;
                    if (currentDraft.captainsObject[0].discordId === msg.author.id) {
                        currentTeam = 'teamA';
                    } else if (currentDraft.captainsObject[1].discordId === msg.author.id) {
                        currentTeam = 'teamB';
                    } else {
                        // Error
                        return {
                            responseMessage:
                                'Error - Something went wrong. Contact a developer or admin.',
                            sendToDm: true
                        };
                    }
                    const otherTeam = currentTeam === 'teamA' ? 'teamB' : 'teamA';

                    if (winOrLoss === 'win') {
                        if (!currentDraft.reportedScores[currentTeam]) {
                            currentDraft.reportedScores[currentTeam] = currentTeam;
                        } else {
                            return {
                                responseMessage: 'Error - you have already reported score.',
                                sendToDm: true
                            };
                        }
                    } else if (winOrLoss === 'loss') {
                        if (!currentDraft.reportedScores[currentTeam]) {
                            currentDraft.reportedScores[currentTeam] = otherTeam;
                        } else {
                            return {
                                responseMessage: 'Error - you have already reported score.',
                                sendToDm: true
                            };
                        }
                    } else {
                        // Error - not win or loss
                        return {
                            responseMessage:
                                'Error - did NOT report match. Please type !match report <win | loss>.',
                            sendToDm: true
                        };
                    }

                    // Both teams have repoted scores.
                    if (currentDraft.reportedScores.teamA && currentDraft.reportedScores.teamB) {
                        // Score is the same
                        if (
                            currentDraft.reportedScores.teamA === currentDraft.reportedScores.teamB
                        ) {
                            const endMessage = `Match has been reported. The winner is: ${
                                currentDraft.reportedScores.teamA
                            }!\n${formatMessageFromPlayers(
                                'Team A',
                                currentDraft.teamA,
                                currentDraft.league
                            )}\n${formatMessageFromPlayers(
                                'Team B',
                                currentDraft.teamB,
                                currentDraft.league
                            )}\nThe rating shown above is your previous rating, and your new rating has been updated to the database.`;
                            for (const player of currentDraft.allPlayers) {
                                const playerClient = await bot.fetchUser(player.discordId);
                                await playerClient.send(endMessage);
                            }

                            const ratingsChange = await updatePlayerRatings(
                                currentDraft.teamA,
                                currentDraft.teamB,
                                currentDraft.reportedScores.teamA,
                                currentDraft.league
                            );
                            await recordMatch(
                                currentDraft.teamA,
                                currentDraft.teamB,
                                currentDraft.reportedScores.teamA,
                                ratingsChange,
                                currentDraft.league
                            );
                            removeDraft(currentDraft.index);
                        } else {
                            currentDraft.reportedScores = {}; // reset
                            await currentDraft.captainsClient[otherTeam].send('Error - scores from both captains differ. Please contact an administrator, or try reporting scores again.');
                            return {
                                responseMessage:
                                    'Error - scores from both captains differ. Please contact an administrator, or try reporting scores again.',
                                sendToDm: true
                            };
                        }
                    } else {
                        return {
                            responseMessage:
                                'Score has been reported. Waiting for the other team Captain to report too.',
                            sendToDm: true
                        };
                    }
                }
                // Error - match is not ongoing
                return {
                    responseMessage: 'Error - did NOT report match. Match has not started yet.',
                    sendToDm: true
                };
            }
            // Error - not captain
            return {
                responseMessage:
                    'Error: you are not a captain for any ongoing matches. Only captains can report scores.',
                sendToDm: true
            };
        }

        // Error - Syntax
        return {
            responseMessage:
                'Syntax error: did NOT report match. Make sure to type: !match report < win | loss >.',
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default reportMatch;
