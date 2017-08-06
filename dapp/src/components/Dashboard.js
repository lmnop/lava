import React, { Component } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import Box from './Box';
import Link from './Link';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class Dashboard extends Component {
  render() {
    const user = this.props.user;
    const contract = this.props.contract;

    const renderParameters = _.map(contract.parameters, (parameter) => {
      return (
        <View key={parameter.name} style={styles.statsRow}>
          <Text style={styles.statsTitle}>
            {parameter.name}
          </Text>
          <Text style={styles.statsValue}>
            {`${parameter.value} ether`}
          </Text>
        </View>
      );
    });

    return (
      <View style={styles.container}>
        <Button
          title="Clear Browser Cache"
          color={Colors.red}
          onPress={this.props.resetApp}
        />
        <Box
          header="Your Ethereum Wallet"
        >
          <Link url={`https://etherscan.io/address/${user.address}`}>
            <Text style={styles.address}>
              {user.address}
            </Text>
          </Link>
          <Text style={styles.balance}>
            {`${user.balance} ether`}
          </Text>
        </Box>
        <Box
          header="Lava Contract"
        >
          <Text style={styles.title}>
            Contract Address
          </Text>
          <Link url={`https://etherscan.io/address/${contract.address}`}>
            <Text style={styles.address}>
              {contract.address}
            </Text>
          </Link>
          <Text style={styles.title}>
            Owner Address
          </Text>
          <Link url={`https://etherscan.io/address/${contract.owner}`}>
            <Text style={styles.address}>
              {contract.owner}
            </Text>
          </Link>
          <Text style={styles.balance}>
            {`${contract.balanceEther} ether`}
          </Text>
          <View style={styles.stats}>
            <Text style={styles.title}>
              Contract Parameters
            </Text>
            {renderParameters}
          </View>
        </Box>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.black,
  },
  address: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '300',
    color: Colors.blue,
  },
  balance: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.green,
  },
  stats: {
    alignSelf: 'stretch',
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statsRow: {
    alignSelf: 'stretch',
    marginTop: 10,
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
    color: Colors.green,
  },
});

const bindStore = (state) => {
  return {
    user: state.user,
    contract: state.contract,
  };
};

const bindActions = dispatch => ({
  resetApp: () => dispatch(userActions.resetApp()),
});

export default connect(bindStore, bindActions)(Dashboard);