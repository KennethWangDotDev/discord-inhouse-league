import { rate, Rating } from 'ts-trueskill';
import { updatePlayerRatingsQuery } from '../queries';

async function updatePlayerRatings(teamA, teamB, winner) {
    // Update ratings
    const previousRatingsA = [];
    const previousRatingsB = [];
    for (const member of teamA) {
        previousRatingsA.push(new Rating(member.rating / 100, member.sigma));
    }
    for (const member of teamB) {
        previousRatingsB.push(new Rating(member.rating / 100, member.sigma));
    }
    let newRatingsA;
    let newRatingsB;
    if (winner === 'teamA') {
        [newRatingsA, newRatingsB] = rate([previousRatingsA, previousRatingsB]);
    } else {
        [newRatingsB, newRatingsA] = rate([previousRatingsB, previousRatingsA]);
    }

    const preparedRatings = [];
    for (const [index, member] of teamA.entries()) {
        const obj = {};
        obj.discordId = member.discordId;
        obj.rating = Math.ceil(newRatingsA[index].mu * 100);
        obj.sigma = newRatingsA[index].sigma;
        preparedRatings.push(obj);
    }
    for (const [index, member] of teamB.entries()) {
        const obj = {};
        obj.discordId = member.discordId;
        obj.rating = Math.ceil(newRatingsB[index].mu * 100);
        obj.sigma = newRatingsB[index].sigma;
        preparedRatings.push(obj);
    }
    await updatePlayerRatingsQuery(preparedRatings);
}

export default updatePlayerRatings;
