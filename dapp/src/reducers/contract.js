import { Actions } from '../constants';

const initialState = {
  owner: '',
  balance: 0,
  activationFee: 0,
  minimumBalance: 0,
  etherPerByte: 0,
  lastPrice: 0,
  lowestPrice: 0,
  highestPrice: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {

    case Actions.APP_RESET: {
      return initialState;
    }

    case Actions.CONTRACT_SET: {
      return {
        ...state,
        ...action.payload,
      };
    }

    default: {
      return state;
    }
  }
}
