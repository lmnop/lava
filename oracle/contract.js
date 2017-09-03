import HDWalletProvider from 'truffle-hdwallet-provider';
import contract from 'truffle-contract';

import Lava from '../build/contracts/Lava.json';

import config from '../config';

const providerUrl = config[process.env.NODE_ENV].providerUrl;
const provider = new HDWalletProvider(config.mnemonic, providerUrl);
const lavaContract = contract(Lava);

lavaContract.setProvider(provider);

setInterval(() => {
  console.log(`Oracle connected to ${providerUrl}`);
}, 1000);

export default async () => {
  if (process.env.NODE_ENV === 'local') {
    const accounts = await new Promise((resolve, reject) => {
      lavaContract.web3.eth.getAccounts((error, value) => {
        return resolve(value);
      });
    });

    return lavaContract.new({
      from: accounts[0],
    });
  } else {
    return lavaContract.deployed();
  }
}
