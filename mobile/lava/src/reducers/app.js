import { Actions } from '../constants';

const initialState = {
  loading: null,
  error: {},
  pending: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {

    case Actions.APP_RESET: {
      return initialState;
    }

    case Actions.APP_LOADING: {
      return {
        ...state,
        loading: action.payload,
        error: initialState.error,
        pending: initialState.pending,
      };
    }

    case Actions.APP_ERROR: {
      console.log('APP ERROR', action.payload);

      return {
        ...state,
        error: action.payload,
        loading: '',
      };
    }

    case Actions.APP_PENDING: {
      return {
        ...state,
        pending: action.payload,
      };
    }

    default: {
      return state;
    }
  }
}
