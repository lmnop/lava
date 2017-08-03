import React from 'react';
import { connect } from 'react-redux';

import Loading from './Loading';
import CreateWallet from './CreateWallet';
import Dashboard from './Dashboard';

function Router(props) {
  if (props.loading) {
    return <Loading />;
  }

  if (props.user.address) {
    return <Dashboard />;
  }

  return <CreateWallet />;
}

const bindStore = (state) => {
  return {
    loading: state.app.loading,
    user: state.user,
  };
};

export default connect(bindStore)(Router);
