const HDWalletProvider = require('truffle-hdwallet-provider');
const config = require('./config');

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: "*",
    },
    test: {
      host: 'localhost',
      port: 8546,
      network_id: "*",
    },
    rinkeby: {
      provider: new HDWalletProvider(config.mnemonic, config.rinkebyUrl),
      network_id: 4,
      gas: 4612388,
    },
    live: {
      provider: new HDWalletProvider(config.mnemonic, config.mainUrl),
      network_id: 1,
      gas: 4612388,
    },
  }
};
