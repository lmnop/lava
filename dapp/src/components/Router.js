import React from 'react';
import { connect } from 'react-redux';

import CreateWallet from './CreateWallet';
import Dashboard from './Dashboard';

function Router(props) {
  if (props.address) {
    return <Dashboard />;
  }

  return <CreateWallet />;
}

const bindStore = (state) => {
  return {
    address: state.user.address,
  };
};

export default connect(bindStore)(Router);
