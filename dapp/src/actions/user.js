import _ from 'lodash';
import HDWalletProvider from 'truffle-hdwallet-provider';
import Web3 from 'web3';
import contract from 'truffle-contract';

import LavaJSON from 'contracts/Lava.json';

import { Actions } from '../constants';

export const resetApp = () => (dispatch) => {
  dispatch({
    type: Actions.APP_RESET,
  });
};

export const useWallet = (mnemonic) => async (dispatch) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: true,
    });

    // SET UP CONTRACT WITH WALLET
    const provider = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/sRC4zPiAwdx1VP1Zi1jq');
    const web3 = new Web3(provider);

    const lavaContract = contract(LavaJSON);
    lavaContract.setProvider(provider);

    const lava = await lavaContract.deployed();

    console.log(lava);

    // GET CONTRACT VALUES
    const owner = await lava.owner();
    const balance = await lava.balance();
    const activationFee = await lava.activationFee();
    const minimumBalance = await lava.minimumBalance();
    const etherPerByte = await lava.etherPerByte();

    dispatch({
      type: Actions.CONTRACT_SET,
      payload: {
        address: lava.address,
        owner,
        balance,
        balanceEther: web3.fromWei(balance, 'ether'),
        activationFee,
        minimumBalance,
        etherPerByte,
        parameters: {
          activationFeeEther: {
            name: 'Activate Fee',
            value: web3.fromWei(activationFee, 'ether'),
          },
          minimumBalanceEther: {
            name: 'Minimum Balance',
            value: web3.fromWei(minimumBalance, 'ether'),
          },
          etherPerByteEther: {
            name: 'Price Per Byte',
            value: web3.fromWei(etherPerByte, 'ether'),
          },
        },
      },
    });

    // GET USER VALUES
    const address = provider.address;

    const addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (error, value) => {
        return resolve(value);
      });
    });

    let userContract = {
      balance: 0,
      data: 0,
      SIMs: [],
    };

    const isUser = await lava.isUser(address);

    if (isUser) {
      const user = await lava.getUser();

      const userBalance = web3.fromWei(user[0], 'ether');
      const userData = user[1].toNumber();
      const userSIMs = _.map(user[2], (hexSIM) => {
        return web3.toAscii(hexSIM).replace(/\0/g, '');
      });

      const getUserSIMs = _.map(user[2], (hexSIM) => {
        return lava.getSIM(hexSIM);
      });

      let SIMs = await Promise.all(getUserSIMs);

      SIMs = _.map(SIMs, (SIM, i) => {
        return {
          hex: user[2][i],
          sid: userSIMs[i],
          dataPaid: SIM[1].toNumber(),
          dataConsumed: SIM[2].toNumber(),
          isActivated: SIM[3],
          updateStatus: SIM[4],
        };
      });

      // todo: can cycle through and grab other info about the SIM from Twilio

      userContract = {
        balance: userBalance,
        data: userData,
        SIMs,
      };
    }

    dispatch({
      type: Actions.USER_SET,
      payload: {
        address,
        balance: web3.fromWei(addressBalance, 'ether'),
        contract: userContract,
      },
    });

    dispatch({
      type: Actions.APP_LOADING,
      payload: false,
    });
  } catch (err) {
    dispatch({
      type: Actions.APP_ERROR,
      payload: err,
    });
  }
};
