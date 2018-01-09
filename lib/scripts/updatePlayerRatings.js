import { rate, Rating } from 'ts-trueskill';
import { updatePlayerRatingsQuery } from '../queries';

async function updatePlayerRatings(teamA, teamB, winner) {
    const previousRatingsA = [];
    const previousRatingsB = [];
    const ratingsChange = {};

    // Setup previousRatings and ratingsChange
    for (const member of teamA) {
        previousRatingsA.push(new Rating(member.rating / 100, member.sigma));
        ratingsChange[member.discordId] = {
            previousRating: member.rating,
            previousSigma: member.sigma
        };
    }
    for (const member of teamB) {
        previousRatingsB.push(new Rating(member.rating / 100, member.sigma));
        ratingsChange[member.discordId] = {
            previousRating: member.rating,
            previousSigma: member.sigma
        };
    }

    // Setup new ratings
    let newRatingsA;
    let newRatingsB;
    if (winner === 'teamA') {
        [newRatingsA, newRatingsB] = rate([previousRatingsA, previousRatingsB]);
    } else {
        [newRatingsB, newRatingsA] = rate([previousRatingsB, previousRatingsA]);
    }

    // Format the ratings in an way to easily push to queries
    const preparedRatings = [];
    for (const [index, member] of teamA.entries()) {
        const obj = {};
        const newRating = Math.ceil(newRatingsA[index].mu * 100);

        ratingsChange[member.discordId].newRating = newRating;
        ratingsChange[member.discordId].newSigma = newRatingsA[index].sigma;

        obj.discordId = member.discordId;
        obj.rating = newRating;
        obj.sigma = newRatingsA[index].sigma;
        preparedRatings.push(obj);
    }
    for (const [index, member] of teamB.entries()) {
        const obj = {};
        const newRating = Math.ceil(newRatingsB[index].mu * 100);

        ratingsChange[member.discordId].newRating = newRating;
        ratingsChange[member.discordId].newSigma = newRatingsB[index].sigma;

        obj.discordId = member.discordId;
        obj.rating = newRating;
        obj.sigma = newRatingsB[index].sigma;
        preparedRatings.push(obj);
    }

    const response = await updatePlayerRatingsQuery(preparedRatings);
    return ratingsChange;
}

export default updatePlayerRatings;
