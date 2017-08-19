import React, { Component } from 'react';
import { StyleSheet, Button, TextInput, View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import Box from './Box';
import Loading from './Loading';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class UserAccount extends Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  renderContent() {
    if (this.props.loading) {
      return (
        <View style={styles.container}>
          <Loading />
        </View>
      );
    }

    return (
      <View style={styles.container}>

      </View>
    );
  }

  render() {
    return (
      <Box
        header="User Account"
      >
        {this.renderContent()}
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 180,
  },
  inputSIM: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.grey,
    borderWidth: 2,
    padding: 10,
  },
  statsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    alignContent: 'space-between',
  },
  statsTitle: {
    flex: 1,
    fontSize: 12,
    color: Colors.black,
    textAlign: 'right',
    paddingRight: 10,
  },
  statsValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.red,
  },
  totalRow: {
    marginTop: 5,
    paddingTop: 5,
    marginBottom: 20,
    borderTopColor: Colors.black,
    borderTopWidth: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    alignContent: 'space-between',
  },
  totalTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.red,
  },
});

const bindStore = (state) => {
  return {
    activationFee: _.get(state.contract.parameters, 'activationFeeEther.value', 0),
    minimumBalance: _.get(state.contract.parameters, 'minimumBalanceEther.value', 0),
    loading: state.app.loading === 'registerSIM' ? true : false,
    error: state.app.error.action === 'registerSIM' ? state.app.error.message : '',
  };
};

const bindActions = dispatch => ({
  registerSIM: (iccid) => dispatch(userActions.registerSIM(iccid)),
});

export default connect(bindStore, bindActions)(UserAccount);
