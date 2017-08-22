import _ from 'lodash';
import HDWalletProvider from 'truffle-hdwallet-provider';
import Web3 from 'web3';
import contract from 'truffle-contract';

import LavaJSON from 'lava-contract';

import { Actions } from '../constants';
import * as oracle from '../oracle';

const getEthereum = async (mnemonic) => {
  const provider = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/sRC4zPiAwdx1VP1Zi1jq');
  const web3 = new Web3(provider);

  const lavaContract = contract(LavaJSON);
  lavaContract.setProvider(provider);

  const lava = await lavaContract.deployed();

  return {
    provider,
    web3,
    lava,
  };
};

const getUserContract = async (address, web3, lava) => {
  const user = await lava.getUser({
    from: address,
  });

  const userBalance = user[0].toNumber();
  const userData = user[1].toNumber();

  const userSIMs = _.map(user[2], (hexSIM) => {
    return web3.toAscii(hexSIM).replace(/\0/g, '');
  });

  const getUserSIMs = _.map(user[2], (hexSIM) => {
    return lava.getSIM(hexSIM);
  });

  const getSIMs = _.map(userSIMs, (iccid) => {
    return oracle.getSIMByICCID(iccid);
  });

  const contractSIMs = await Promise.all(getUserSIMs);
  const twilioSIMs = await Promise.all(getSIMs);

  return {
    balance: userBalance,
    blanceEther: web3.fromWei(userBalance, 'ether'),
    data: userData,
    SIMs: _.map(contractSIMs, (SIM, i) => {
      return {
        hex: user[2][i],
        dataPaid: SIM[1].toNumber(),
        dataConsumed: SIM[2].toNumber(),
        isActivated: SIM[3],
        updateStatus: SIM[4],
        twilio: twilioSIMs[i],
      };
    }),
  };
};

export const resetApp = () => (dispatch) => {
  dispatch({
    type: Actions.APP_RESET,
  });
};

export const useWallet = (mnemonic) => async (dispatch) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'useWallet',
    });

    const { provider } = await getEthereum(mnemonic);

    const address = provider.address;

    dispatch({
      type: Actions.USER_SET,
      payload: {
        mnemonic,
        address,
      },
    });

    dispatch({
      type: Actions.APP_LOADING,
    });
  } catch (err) {
    dispatch({
      type: Actions.APP_ERROR,
      payload: {
        action: 'useWallet',
        message: err.message || 'failed',
      },
    });
  }
};

export const getLavaContract = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'getLavaContract',
    });

    const state = getState();

    const address = state.user.address;

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (error, value) => {
        return resolve(value);
      });
    });

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
          etherPerGBEther: {
            name: 'Price Per GB',
            value: web3.fromWei(etherPerByte, 'ether') * 1000000000,
          },
        },
      },
    });

    let userContract = {
      balance: 0,
      data: 0,
      SIMs: [],
    };

    const isUser = await lava.isUser(address);

    if (isUser) {
      userContract = await getUserContract(address, web3, lava);
    }

    dispatch({
      type: Actions.USER_SET,
      payload: {
        balance: web3.fromWei(addressBalance, 'ether'),
        contract: userContract,
      },
    });

    dispatch({
      type: Actions.APP_LOADING,
    });
  } catch (err) {
    dispatch({
      type: Actions.APP_ERROR,
      payload: {
        action: 'getLavaContract',
        message: err.message || 'failed',
      },
    });
  }
};

export const registerSIM = (iccid) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'registerSIM',
    });

    const state = getState();

    const SIM = await oracle.getSIMByICCID(iccid);

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const simHex = web3.fromAscii(SIM.iccid).padEnd(66, 0);

    const isSIM = await lava.isSIM(simHex);

    if (isSIM) {
      throw new Error('SIM already registered');
    }

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    const activationFee = await lava.activationFee();
    const minimumBalance = await lava.minimumBalance();

    const registerAmount = activationFee.toNumber() + minimumBalance.toNumber();

    if (addressBalance < registerAmount) {
      throw new Error('insufficient balance');
    }

    await lava.register(simHex, {
      from: state.user.address,
      value: registerAmount,
    });

    const userContract = await getUserContract(state.user.address, web3, lava);

    addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    dispatch({
      type: Actions.USER_SET,
      payload: {
        balance: web3.fromWei(addressBalance, 'ether'),
        contract: userContract,
      },
    });

    dispatch({
      type: Actions.APP_LOADING,
    });
  } catch (err) {
    dispatch({
      type: Actions.APP_ERROR,
      payload: {
        action: 'registerSIM',
        message: err.message || 'failed',
      },
    });
  }
};

export const purchaseData = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'purchaseData',
    });

    const state = getState();

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const puchasedInEther = parseFloat(state.contract.parameters.etherPerGBEther.value) * parseFloat(data);
    const purchasedInWei = web3.toWei(puchasedInEther, 'ether');

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    if (addressBalance < purchasedInWei) {
      throw new Error('insufficient balance');
    }

    const transactionInterval = setInterval(() => {
      web3.eth.getBlock('pending', true, (error, block) => {
        const transaction = _.find(block.transactions, {
          from: state.user.address,
          to: lava.address
        });

        if (transaction) {
          dispatch({
            type: Actions.APP_PENDING,
            payload: transaction.hash,
          });
        }
      });
    }, 1000);

    await lava.purchaseData({
      from: state.user.address,
      value: purchasedInWei,
    });

    clearInterval(transactionInterval);

    const userContract = await getUserContract(state.user.address, web3, lava);

    addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    dispatch({
      type: Actions.USER_SET,
      payload: {
        balance: web3.fromWei(addressBalance, 'ether'),
        contract: userContract,
      },
    });

    dispatch({
      type: Actions.APP_LOADING,
    });
  } catch (err) {
    dispatch({
      type: Actions.APP_ERROR,
      payload: {
        action: 'purchaseData',
        message: err.message || 'failed',
      },
    });
  }
};

export const sellData = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'sellData',
    });

    const state = getState();

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const dataInBytes = data / 1000000000;

    let gasEstimate = await lava.sellData.estimateGas(dataInBytes, {
      from: state.user.address,
    });

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    if (addressBalance < gasEstimate) {

    }

    console.log('GAS', gasEstimate);

    dispatch({
      type: Actions.APP_LOADING,
    });
  } catch (err) {
    dispatch({
      type: Actions.APP_ERROR,
      payload: {
        action: 'sellData',
        message: err.message || 'failed',
      },
    });
  }
};
