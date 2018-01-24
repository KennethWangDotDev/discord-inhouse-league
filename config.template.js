const environments = {
    development: 'development',
    production: 'production'
};

const cfg = {
    discordToken: '',
    graphcoolId: '',
    graphcoolToken: '',
    environment: environments.production,
    server: {
        development: 'Test Server',
        production: 'InHouse League NA'
    },
    cmdChannels: {
        development: ['test'],
        production: ['match-bot', 'misc-commands', 'pro-match-bot']
    },
    trueskill: {
        amateur: {
            initialRating: 1500,
            initialSigma: 1.813 * 2
        },
        pro: {
            initialRating: 2500,
            initialSigma: 1.813
        }
    },
    admins: []
};

export default cfg;
