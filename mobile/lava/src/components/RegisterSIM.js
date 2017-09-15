import React, { Component } from 'react';
import { StyleSheet, Button, TextInput, View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import Box from './Box';
import Loading from './Loading';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class RegisterSIM extends Component {

  constructor(props) {
    super(props);

    this.state = {
      iccid: '',
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
          onChangeText={(iccid) => {
            if (iccid.length <= 19) {
              this.setState({iccid});
            }
          }}
          value={this.state.iccid}
          placeholder="SIM ICCID"
          keyboardType="numeric"
        />
        <View style={styles.statsRow}>
          <Text style={styles.statsTitle}>
            Activation Fee
          </Text>
          <Text style={styles.statsValue}>
            {`${this.props.activationFee} ether`}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsTitle}>
            Minimum Balance
          </Text>
          <Text style={styles.statsValue}>
            {`${this.props.minimumBalance} ether`}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalTitle}>
            Total
          </Text>
          <Text style={styles.totalValue}>
            {`${parseFloat(this.props.minimumBalance) + parseFloat(this.props.activationFee)} ether`}
          </Text>
        </View>
        <Button
          title="Register"
          color={Colors.green}
          disabled={this.state.iccid.length !== 19}
          onPress={() => {
            this.props.registerSIM(this.state.iccid);

            this.setState({
              iccid: '',
            });
          }}
        />
      </View>
    );
  }

  render() {
    return (
      <Box
        header="Register New SIM"
        footer={this.props.error}
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
    fontSize: 14,
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
    pending: state.app.pending,
  };
};

const bindActions = dispatch => ({
  registerSIM: (iccid) => dispatch(userActions.registerSIM(iccid)),
});

export default connect(bindStore, bindActions)(RegisterSIM);
