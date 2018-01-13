/* ==========================================
*  Dependencies
/* ========================================== */
import { GraphQLClient } from 'graphql-request';
import Bluebird from 'bluebird';
import _ from 'lodash';
import cfg from '../../config';

/* ==========================================
*  GraphQL Setup
/* ========================================== */

const headers = {
    Authorization: `Bearer ${cfg.graphcoolToken}`
};

const client = new GraphQLClient(`https://api.graph.cool/simple/v1/${cfg.graphcoolId}`, {
    headers
});

/* ==========================================
*  Functions
/* ========================================== */

function getCurrentIsoDate() {
    const date = new Date();
    return date.toISOString();
}

/* ==========================================
*  Functional Query Helpers
/* ========================================== */

/**
 * Queries the GraphQL Database to find existing entries
 * @param {String} node - Name of the node to query
 * @param {Array.<String>} properties - List of properties to query for
 */
const queryExisting = async (node, properties = []) => {
    // Get count first
    const countQuery = `
        query {
            _all${node}sMeta {
                count
            }
        }
    `;
    const countResponse = await client.request(countQuery, {});
    const { count } = countResponse[`_all${node}sMeta`];
    let results = [];
    for (let i = 0; i < Math.ceil(count / 1000); i += 1) {
        const query = `
            query all${node}s(
                $skipNum: Int!
            ) {
                all${node}s(
                    first: 1000
                    skip: $skipNum
                ) {
                    id
                    ${properties.join('\n')}
                }
            }
        `;
        const skipNum = 1000 * i;
        const response = await client.request(query, { skipNum });
        results = results.concat(response[`all${node}s`]);
    }

    return results;
};

/* ==========================================
*  Maps
/* ========================================== */

/**
 * A map is a way of getting X information when you only have Y information
 */
const maps = {
    playerDiscordIdToId: {}
};

/**
 * Fills up data for the specificed map from query response
 * @param {Object} response - GQL query response
 * @param {String} mapName - Name of the map to fill data
 * @param {String} propLeft - The name of the property in the response to be the key of the specified map object
 * @param {String} propRight - The name of the property in the reponse to be the value of the key
 */
function setupMapFromResponse(response, mapName, propLeft, propRight) {
    for (const list of response) {
        for (const key in list) {
            if (list.hasOwnProperty(key)) {
                maps[mapName][list[key][propLeft]] = list[key][propRight];
            }
        }
    }
}

// Maps must be set up at the start for data consistency.
async function setupPlayersMap() {
    const result = await queryExisting('Player', ['discordId']);
    for (const obj of result) {
        maps.playerDiscordIdToId[obj.discordId] = obj.id;
    }
}
// This is an async IFFE that runs immediately
(async function () {
    await setupPlayersMap();
}());

/* ==========================================
*  Queries
/* ========================================== */

/**
 * Adds a player to the database
 * @param {Object} player - A single player object
 */
const createPlayerQuery = async (player) => {
    const mutation = `
        mutation {
            k_${player.discordId}: createPlayer(
                discordId: "${player.discordId}"
                username: "${player.username}",
                rating: ${player.rating},
                sigma: ${player.sigma}
            ) {
                discordId
                id
            }
        }
    `;

    const response = await client.request(mutation);
    setupMapFromResponse([response], 'playerDiscordIdToId', 'discordId', 'id');
    return response.Player;
};

/**
 * Adds a match to the database
 * @param {Object} player - A single player object
 */
const createMatchQuery = async (league) => {
    const mutation = `
        mutation {
            k_match: createMatch(
                date: "${getCurrentIsoDate()}"
                league: "${league}"
            ) {
                id
            }
        }
    `;

    const response = await client.request(mutation);
    return response.k_match;
};

/**
 * Returns information for a Player from their Discord ID
 * @param {String} discordId
 */
const getPlayerFromDiscordIdQuery = async (discordId) => {
    const query = `
        query {
            Player(discordId: "${discordId}") {
                username
                rating
                ratingPro
                sigma
                sigmaPro
            }
        }
    `;

    const response = await client.request(query);
    return response.Player;
};

/**
 * Returns information for a Player from their assigned Username
 * @param {String} username
 */
const getPlayerFromUsernameQuery = async (username) => {
    const query = `
        query {
            Player(username: "${username}") {
                username
                rating
                ratingPro
                sigma
                sigmaPro
            }
        }
    `;

    const response = await client.request(query);
    return response.Player;
};

/**
 * Returns information for a Player from their assigned Username
 * @param {Array.<Object>} players - Array of players to update their ratings
 */
const updatePlayerRatingsQuery = async (players, league) => {
    let appendLeague = '';
    if (league === 'pro') {
        appendLeague = 'Pro';
    }
    const BATCH_SIZE = 50;
    const mutations = _.chain(players)
        .map(player => `
            k_${player.discordId}: updatePlayer(
                id: "${maps.playerDiscordIdToId[player.discordId]}"
                rating${appendLeague}: ${player.rating},
                sigma${appendLeague}: ${player.sigma}
            ) { 
                id 
            }
        `)
        .chunk(BATCH_SIZE)
        .map(chunk => `
            mutation {
                ${chunk.join('\n')}
            }
        `)
        .value();

    const response = await Bluebird.map(mutations, mutation => client.request(mutation), {
        concurrency: 2
    });
    return response;
};

const updatePlayerPro = async (player, pro) => {
    const mutation = `
    mutation {
        k_match: updatePlayer(
            id: "${maps.playerDiscordIdToId[player.discordId]}"
            pro: ${pro}
        ) {
            id
        }
    }
`;

    const response = await client.request(mutation);
    return response.k_match;
};

/**
 * Creates a relationship in the DB between Players and Matches
 * @param {Array.<Object>} players - Array of players
 * @param {matchId} matchId
 * @param {Int} win - If the players won or lost (values are -1, 0, or -1)
 */
const associatePlayersToMatchesQuery = async (players, matchId, win) => {
    let mutationName;
    let playerVarName;
    let matchVarName;

    if (win === 0) {
        mutationName = 'addToPlayerOnMatch';
        playerVarName = 'playersPlayer';
        matchVarName = 'matchesMatch';
    } else if (win === -1) {
        mutationName = 'addToPlayerOnLostMatch';
        playerVarName = 'losersPlayer';
        matchVarName = 'lostMatchesMatch';
        await associatePlayersToMatchesQuery(players, matchId, 0);
    } else {
        mutationName = 'addToPlayerOnWonMatch';
        playerVarName = 'winnersPlayer';
        matchVarName = 'wonMatchesMatch';
        await associatePlayersToMatchesQuery(players, matchId, 0);
    }

    const BATCH_SIZE = 50;
    const mutations = _.chain(players)
        .map(player => `
            k_${player.discordId}: ${mutationName} (
                ${playerVarName}Id: "${maps.playerDiscordIdToId[player.discordId]}"
                ${matchVarName}Id: "${matchId}"
            ) { 
                ${playerVarName} {
                    username
                }
            }
        `)
        .chunk(BATCH_SIZE)
        .map(chunk => `
            mutation {
                ${chunk.join('\n')}
            }
        `)
        .value();

    const response = await Bluebird.map(mutations, mutation => client.request(mutation), {
        concurrency: 2
    });
    return response;
};

const playerMatchRatingsChangeQuery = async (players, matchId, ratingsChangeObject) => {
    const BATCH_SIZE = 50;
    const mutations = _.chain(players)
        .map(player => `
            k_${player.discordId}: createPlayerMatchRatingsChange (
                playerId: "${maps.playerDiscordIdToId[player.discordId]}"
                matchId: "${matchId}"
                ratingsChange: ${ratingsChangeObject[player.discordId].newRating -
                    ratingsChangeObject[player.discordId].previousRating}
                sigmaChange: ${ratingsChangeObject[player.discordId].newSigma -
                    ratingsChangeObject[player.discordId].previousSigma}
            ) { 
                id
            }
        `)
        .chunk(BATCH_SIZE)
        .map(chunk => `
            mutation {
                ${chunk.join('\n')}
            }
        `)
        .value();

    const response = await Bluebird.map(mutations, mutation => client.request(mutation), {
        concurrency: 2
    });
    return response;
};

export {
    queryExisting,
    createPlayerQuery,
    getPlayerFromDiscordIdQuery,
    getPlayerFromUsernameQuery,
    createMatchQuery,
    updatePlayerRatingsQuery,
    associatePlayersToMatchesQuery,
    playerMatchRatingsChangeQuery
};
