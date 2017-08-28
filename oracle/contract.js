import HDWalletProvider from 'truffle-hdwallet-provider';
import Web3 from 'web3';
import contract from 'truffle-contract';

import Lava from '../build/contracts/Lava.json';

import config from '../config';

const providerUrl = config[process.env.NODE_ENV].providerUrl;

setInterval(() => {
  console.log(`Oracle connected to ${providerUrl}`);
}, 1000); // Every second

const provider = new HDWalletProvider(config.mnemonic, providerUrl);
const lavaContract = contract(Lava);

lavaContract.setProvider(provider);

export const getWeb3 = () => new Web3(provider);

export const getLavaContract = () => lavaContract.deployed();
