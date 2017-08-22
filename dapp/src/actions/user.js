import _ from 'lodash';
import HDWalletProvider from 'truffle-hdwallet-provider';
import Web3 from 'web3';
import contract from 'truffle-contract';

import LavaJSON from 'lava-contract';

import { Actions } from '../constants';
import * as api from '../api';

const handleError = (dispatch, err, action) => {
  dispatch({
    type: Actions.APP_ERROR,
    payload: {
      action,
      message: err.message || 'failed',
    },
  });
};

const getEthereum = async (mnemonic) => {
  let providerUrl = `https://rinkeby.infura.io/${process.env.REACT_APP_INFURA_TOKEN}`;

  const provider = new HDWalletProvider(mnemonic, providerUrl);
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
    return api.getSIMByICCID(iccid);
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

const getLavaContractDetails = async (web3, lava) => {
  const owner = await lava.owner();
  const balance = await lava.balance();
  const activationFee = await lava.activationFee();
  const minimumBalance = await lava.minimumBalance();
  const etherPerByte = await lava.etherPerByte();

  return {
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
    handleError(dispatch, err, 'useWallet');
  }
};

export const refresh = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'refresh',
    });

    const state = getState();

    const address = state.user.address;

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const userContract = await getUserContract(address, web3, lava);

    const addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (error, value) => {
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

    const lavaDetails = await getLavaContractDetails(web3, lava);

    dispatch({
      type: Actions.CONTRACT_SET,
      payload: lavaDetails,
    });

    dispatch({
      type: Actions.APP_LOADING,
    });
  } catch (err) {
    handleError(dispatch, err, 'refresh');
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

    setInterval(() => {
      web3.eth.getBlock('pending', true, (error, block) => {
        let transaction;

        if (block) {
          transaction = _.find(block.transactions, {
            from: address,
            to: lava.address,
          });
        }

        dispatch({
          type: Actions.APP_PENDING,
          payload: transaction ? transaction.hash : null,
        });
      });
    }, 1000);

    const addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(address, (error, value) => {
        return resolve(value);
      });
    });

    const lavaDetails = await getLavaContractDetails(web3, lava);

    dispatch({
      type: Actions.CONTRACT_SET,
      payload: lavaDetails,
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
    handleError(dispatch, err, 'getLavaContract');
  }
};

export const registerSIM = (iccid) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'registerSIM',
    });

    const state = getState();

    const SIM = await api.getSIMByICCID(iccid);

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const simHex = web3.fromAscii(SIM.iccid).padEnd(66, 0);

    const isSIM = await lava.isSIM(simHex);

    if (isSIM) {
      throw new Error('SIM already registered');
    }

    let gasEstimate = await lava.purchaseData.register(simHex, {
      from: state.user.address,
    });

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    const activationFee = await lava.activationFee();
    const minimumBalance = await lava.minimumBalance();

    const registerAmount = activationFee.toNumber() + minimumBalance.toNumber();

    if (addressBalance < (registerAmount + gasEstimate)) {
      throw new Error('insufficient balance');
    }

    await lava.register(simHex, {
      from: state.user.address,
      value: registerAmount,
    });
  } catch (err) {
    handleError(dispatch, err, 'registerSIM');
  }
};

export const purchaseData = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'purchaseData',
    });

    if (parseFloat(data) <= 0) {
      throw new Error('need positive value');
    }

    const state = getState();

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const puchasedInEther = parseFloat(state.contract.parameters.etherPerGBEther.value) * parseFloat(data);
    const purchasedInWei = web3.toWei(puchasedInEther, 'ether');

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    let gasEstimate = await lava.purchaseData.estimateGas({
      from: state.user.address,
    });

    if (addressBalance < (purchasedInWei + gasEstimate)) {
      throw new Error('insufficient balance');
    }

    await lava.purchaseData({
      from: state.user.address,
      value: purchasedInWei,
    });
  } catch (err) {
    handleError(dispatch, err, 'purchaseData');
  }
};

export const sellData = (data) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'sellData',
    });

    if (parseFloat(data) <= 0) {
      throw new Error('need positive value');
    }

    const state = getState();

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const dataInBytes = parseFloat(data) * 1000000000;
    const sellingInEther = parseFloat(state.contract.parameters.etherPerGBEther.value) * parseFloat(data);
    const sellingInWei = web3.toWei(sellingInEther, 'ether');

    let gasEstimate = await lava.sellData.estimateGas(dataInBytes, {
      from: state.user.address,
    });

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    if (addressBalance < gasEstimate) {
      throw new Error('insufficient balance');
    }

    if (state.contract.balance.toNumber() < sellingInWei) {
      throw new Error('insufficient contract balance');
    }

    if (state.user.contract.data < dataInBytes) {
      throw new Error('insufficient data owned');
    }

    await lava.sellData(dataInBytes, {
      from: state.user.address,
    });
  } catch (err) {
    handleError(dispatch, err, 'sellData');
  }
};

export const deposit = (amount) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'deposit',
    });

    if (parseFloat(amount) <= 0) {
      throw new Error('need positive value');
    }

    const state = getState();

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const depositInWei = web3.toWei(amount, 'ether');

    let gasEstimate = await lava.deposit.estimateGas({
      from: state.user.address,
    });

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    if (addressBalance < gasEstimate) {
      throw new Error('insufficient balance');
    }

    await lava.deposit({
      from: state.user.address,
      value: depositInWei,
    });
  } catch (err) {
    handleError(dispatch, err, 'deposit');
  }
};

export const withdraw = (amount) => async (dispatch, getState) => {
  try {
    dispatch({
      type: Actions.APP_LOADING,
      payload: 'withdraw',
    });

    if (parseFloat(amount) <= 0) {
      throw new Error('need positive value');
    }

    const state = getState();

    const { web3, lava } = await getEthereum(state.user.mnemonic);

    const withdrawInWei = web3.toWei(amount, 'ether');

    let gasEstimate = await lava.withdraw.estimateGas(withdrawInWei, {
      from: state.user.address,
    });

    let addressBalance = await new Promise((resolve, reject) => {
      web3.eth.getBalance(state.user.address, (error, value) => {
        return resolve(value);
      });
    });

    if (addressBalance < gasEstimate) {
      throw new Error('insufficient balance');
    }

    if (state.user.contract.balance < withdrawInWei) {
      throw new Error('insufficient contract balance');
    }

    await lava.withdraw(withdrawInWei, {
      from: state.user.address,
    });
  } catch (err) {
    handleError(dispatch, err, 'withdraw');
  }
};
