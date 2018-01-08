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

function sanitize(str) {
    return str.split('"').join('');
}

function unixToIso(date) {
    return new Date(Number(date * 1000)).toISOString();
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

const maps = {
    playerDiscordIdToId: {}
};

function setupMapFromResponse(response, mapName, propLeft, propRight) {
    for (const list of response) {
        for (const key in list) {
            if (list.hasOwnProperty(key)) {
                maps[mapName][list[key][propLeft]] = list[key][propRight];
            }
        }
    }
}

// Load maps
async function setupPlayersMap() {
    const result = await queryExisting('Player', ['discordId']);
    for (const obj of result) {
        maps.playerDiscordIdToId[obj.discordId] = obj.id;
    }
}
(async function () {
    await setupPlayersMap();
}());

/* ==========================================
*  Queries
/* ========================================== */

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
    return response;
};

const getPlayerFromDiscordIdQuery = async (discordId) => {
    const query = `
        query {
            Player(discordId: "${discordId}") {
                username
                rating
                sigma
            }
        }
    `;

    const response = await client.request(query);
    return response;
};

const getPlayerFromUsernameQuery = async (username) => {
    const query = `
        query {
            Player(username: "${username}") {
                username
                rating
                sigma
            }
        }
    `;

    const response = await client.request(query);
    return response;
};

const updatePlayerRatings = async (players) => {
    const BATCH_SIZE = 50;
    const mutations = _.chain(players)
        .map(player => `
            k_${player.discordId}: updatePlayer(
                id: "${maps.playerDiscordIdToId[player.discordId]}"
                rating: ${player.rating},
                sigma: ${player.sigma}
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
    updatePlayerRatings
};
