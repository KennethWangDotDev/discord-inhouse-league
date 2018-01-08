import { rate, Rating, quality } from 'ts-trueskill';
import { isCaptain, getDraftFromDiscordId, formatMessageFromPlayers } from '../scripts/drafting';
import { updatePlayerRatings } from '../queries';
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
                            currentDraft.reportedScores[currentTeam] = 'teamA';
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
                                currentDraft.teamA
                            )}\n${formatMessageFromPlayers(
                                'Team B',
                                currentDraft.teamB
                            )}.\nThe rating shown above is your previous rating, and your new rating has been updated to the database.`;
                            for (const player of currentDraft.allPlayers) {
                                const playerClient = await bot.fetchUser(player.discordId);
                                await playerClient.send(endMessage);
                            }

                            // Update ratings
                            const previousRatingsA = [];
                            const previousRatingsB = [];
                            for (const member of currentDraft.teamA) {
                                previousRatingsA.push(new Rating(member.Player.rating / 100, member.Player.sigma));
                            }
                            for (const member of currentDraft.teamB) {
                                previousRatingsB.push(new Rating(member.Player.rating / 100, member.Player.sigma));
                            }
                            const [newRatingsA, newRatingsB] = rate([
                                previousRatingsA,
                                previousRatingsB
                            ]);
                            const preparedRatings = [];
                            for (const [index, member] of currentDraft.teamA.entries()) {
                                const obj = {};
                                obj.discordId = member.discordId;
                                obj.rating = newRatingsA[index].mu;
                                obj.sigma = newRatingsA[index].sigma;
                                preparedRatings.push(obj);
                            }
                            for (const [index, member] of currentDraft.teamB.entries()) {
                                const obj = {};
                                obj.discordId = member.discordId;
                                obj.rating = newRatingsB[index].mu * 100;
                                obj.sigma = newRatingsB[index].sigma;
                                preparedRatings.push(obj);
                            }
                            await updatePlayerRatings(preparedRatings);
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
                'Syntax error: did NOT draft player. Make sure to type: !draft <username>.',
            deleteSenderMessage: false
        };
    }

    // Resolve promise
    return false;
}

export default draft;
