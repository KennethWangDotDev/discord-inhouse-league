import {
    createMatchQuery,
    associatePlayersToMatchesQuery,
    playerMatchRatingsChangeQuery
} from '../queries';

async function updatePlayerRatings(teamA, teamB, winner, ratingsChange) {
    const response = await createMatchQuery();
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

updatePlayerRatings();

export default updatePlayerRatings;
