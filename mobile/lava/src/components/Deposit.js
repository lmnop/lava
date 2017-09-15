import React, { Component } from 'react';
import { StyleSheet, Button, TextInput, View } from 'react-native';
import { connect } from 'react-redux';

import Box from './Box';
import Loading from './Loading';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class Deposit extends Component {

  constructor(props) {
    super(props);

    this.state = {
      amount: '',
    };
  }

  renderContent() {
    if (this.props.loading || this.props.pending) {
      return (
        <View style={styles.container}>
          <Loading />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.inputSIM}
          onChangeText={(amount) => {
            this.setState({amount});
          }}
          value={this.state.amount}
          placeholder="Ether Amount"
          keyboardType="numeric"
        />
        <Button
          title="Deposit"
          color={Colors.green}
          disabled={!this.state.amount}
          onPress={() => {
            this.props.deposit(this.state.amount);

            this.setState({
              amount: '',
            });
          }}
        />
      </View>
    );
  }

  render() {
    return (
      <Box
        header="Deposit"
        footer={this.props.error}
      >
        {this.renderContent()}
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: 100,
  },
  inputSIM: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.grey,
    borderWidth: 2,
    padding: 10,
    marginBottom: 20,
  },
});

const bindStore = (state) => {
  return {
    loading: state.app.loading === 'deposit',
    error: state.app.error.action === 'deposit' ? state.app.error.message : '',
    pending: state.app.pending,
  };
};

const bindActions = dispatch => ({
  deposit: (amount) => dispatch(userActions.deposit(amount)),
});

export default connect(bindStore, bindActions)(Deposit);
