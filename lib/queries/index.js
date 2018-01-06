/* ==========================================
*  Dependencies
/* ========================================== */
import cfg from '../../config';
import { GraphQLClient } from 'graphql-request';
import Bluebird from 'bluebird';
import _ from 'lodash';

/* ==========================================
*  GraphQL Setup
/* ========================================== */

const headers = {
    // if needed, inject a PAT
    // 'Authorization': 'Bearer __PERMANENT_AUTH_TOKEN__'
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

function cleanName(str) {
    return str
        .split(' ')
        .join('')
        .split(':')
        .join('')
        .split('-')
        .join('')
        .split('#')
        .join('');
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
*  Queries
/* ========================================== */

/* Example code from another project */
// const createCircuitsQuery = async (circuits) => {
//     const BATCH_SIZE = 50;
//     const mutations = _.chain(circuits)
//         .map(circuit => `
//             k_${circuit.name.split(' ').join('')}: createCircuit(
//                 name: "${circuit.name}",
//                 url: ${circuit.url !== undefined ? `"${circuit.url}"` : null}
//             ) {
//                 id
//                 name
//             }
//         `)
//         .chunk(BATCH_SIZE)
//         .map(chunk => `
//             mutation {
//                 ${chunk.join('\n')}
//             }
//         `)
//         .value();

//     const response = await Bluebird.map(mutations, mutation => client.request(mutation), {
//         concurrency: 2
//     });
//     setupMapFromResponse(response, 'circuitNameToId', 'name', 'id');
//     return response;
// };

export { queryExisting };
