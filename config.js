require('dotenv').config();

module.exports = {
  mnemonic: process.env.MNEMONIC,
  rinkebyUrl: `https://rinkeby.infura.io/${process.env.INFURA_TOKEN}`,
  mainUrl: `https://mainnet.infura.io/${process.env.INFURA_TOKEN}`,
};
