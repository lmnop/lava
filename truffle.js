const HDWalletProvider = require('truffle-hdwallet-provider');
const config = require('./config');

const rinkebyProvider = new HDWalletProvider(config.mnemonic, config.rinkeby.providerUrl);
const mainProvider = new HDWalletProvider(config.mnemonic, config.main.providerUrl);

console.log('Rinkeby Address', rinkebyProvider.address);
console.log('Main Address', mainProvider.address);

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: "*",
    },
    rinkeby: {
      provider: rinkebyProvider,
      network_id: 4,
      gas: 4612388,
    },
    main: {
      provider: mainProvider,
      network_id: 1,
      gas: 4612388,
    },
  }
};
