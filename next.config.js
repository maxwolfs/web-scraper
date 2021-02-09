    module.exports = {
    chainWebpackMainProcess: (config) => {
        config.module.rule('mjs').test(/\.mjs$/).type('javascript/auto').end();
    },
    }