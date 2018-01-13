import {
    createMatchQuery,
    associatePlayersToMatchesQuery,
    playerMatchRatingsChangeQuery
} from '../queries';

async function updatePlayerRatings(teamA, teamB, winner, ratingsChange, league) {
    const response = await createMatchQuery(league);
    const matchId = response.id;
    if (winner === 'teamA') {
        await associatePlayersToMatchesQuery(teamA, matchId, 1);
        await associatePlayersToMatchesQuery(teamB, matchId, -1);
    } else {
        await associatePlayersToMatchesQuery(teamA, matchId, -1);
        await associatePlayersToMatchesQuery(teamB, matchId, 1);
    }

    await playerMatchRatingsChangeQuery([...teamA, ...teamB], matchId, ratingsChange);

    // Resolve promise
    return true;
}

export default updatePlayerRatings;
