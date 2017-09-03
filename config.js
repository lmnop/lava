require('dotenv').config();

module.exports = {
  mnemonic: process.env.MNEMONIC,
  port: process.env.PORT || 5000,
  twilio: {
    sid: process.env.TWILIO_SID,
    token: process.env.TWILIO_TOKEN,
  },
  local: {
    providerUrl: 'http://localhost:8545',
  },
  rinkeby: {
    providerUrl: `https://rinkeby.infura.io/${process.env.INFURA_TOKEN}`,
  },
  main: {
    providerUrl: `https://mainnet.infura.io/${process.env.INFURA_TOKEN}`,
  },
};
