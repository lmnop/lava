const HDWalletProvider = require('truffle-hdwallet-provider');
const config = require('./config');

const provider = new HDWalletProvider(config.mnemonic, 'https://rinkeby.infura.io/');

console.log('Owner Address:', provider.address);

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
      provider,
      network_id: 4,
    },
    live: {
      host: 'localhost',
      port: 8547,
      network_id: 1,
      from: config.address,
    },
  }
};
