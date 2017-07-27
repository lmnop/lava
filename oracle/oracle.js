import HDWalletProvider from 'truffle-hdwallet-provider';
// import twilio from 'twilio';
import Web3 from 'web3';
import contract from 'truffle-contract';

import Lava from '../build/contracts/Lava.json';

import config from '../config';

const providerUrl = config[process.env.NODE_ENV].providerUrl;

// const client = new twilio(config.twilio.sid, config.twilio.token);
const provider = new HDWalletProvider(config.mnemonic, providerUrl);
const lavaContract = contract(Lava);

const isDev = process.env.NODE_ENV === 'development';

lavaContract.setProvider(provider);

export const web3 = new Web3(provider);

export const getLavaContract = () => {
  if (isDev) {
    return lavaContract.new({
      from: web3.eth.accounts[0],
      gas: 4712388,
    });
  }

  return lavaContract.deployed();
};

