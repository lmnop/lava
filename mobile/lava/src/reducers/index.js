import { combineReducers } from 'redux';
import app from './app';
import user from './user';
import contract from './contract';

export default combineReducers({
  app,
  user,
  contract,
});
