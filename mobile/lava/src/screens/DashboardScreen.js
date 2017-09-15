import React, { Component } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import Box from '../components/Box';
import Link from '../components/Link';
import Loading from '../components/Loading';
import TransactionPending from '../components/TransactionPending';
import RegisterSIM from '../components/RegisterSIM';
import UserAccount from '../components/UserAccount';
import PurchaseData from '../components/PurchaseData';
import SellData from '../components/SellData';
import Deposit from '../components/Deposit';
import Withdraw from '../components/Withdraw';
import SIM from '../components/SIM';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class DashboardScreen extends Component {

  componentWillMount() {
    this.props.getLavaContract();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.pending && !nextProps.pending && !nextProps.loading) {
      this.props.refresh();
    }
  }

  renderUserAccount() {
    if (_.isEmpty(this.props.user.contract.SIMs)) {
      return null;
    }

    return <UserAccount />;
  }

  renderPurchaseData() {
    if (_.isEmpty(this.props.user.contract.SIMs)) {
      return null;
    }

    return <PurchaseData />;
  }

  renderSellData() {
    if (_.isEmpty(this.props.user.contract.SIMs)) {
      return null;
    }

    return <SellData />;
  }

  renderDeposit() {
    if (_.isEmpty(this.props.user.contract.SIMs)) {
      return null;
    }

    return <Deposit />;
  }

  renderWithdraw() {
    if (_.isEmpty(this.props.user.contract.SIMs)) {
      return null;
    }

    return <Withdraw />;
  }

  renderSIMs() {
    if (_.isEmpty(this.props.user.contract.SIMs)) {
      return null;
    }

    return _.map(this.props.user.contract.SIMs, (sim) => {
      return <SIM key={sim.hex} sim={sim} />;
    });
  }

  render() {
    const user = this.props.user;
    const contract = this.props.contract;

    if (this.props.loading) {
      return <Loading />;
    }

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
        <Box
          header="Your Ethereum Wallet"
        >
          <Link
            url={`https://rinkeby.etherscan.io/address/${user.address}`}
            text={user.address}
            style={styles.address}
          />
          <Text style={styles.balance}>
            {`${user.balance} ether`}
          </Text>
        </Box>
        {this.renderUserAccount()}
        {this.renderSIMs()}
        {this.renderPurchaseData()}
        {this.renderSellData()}
        {this.renderDeposit()}
        {this.renderWithdraw()}
        <RegisterSIM />
        <Box
          header="Lava Contract"
        >
          <Text style={styles.title}>
            Contract Address
          </Text>
          <Link
            url={`https://rinkeby.etherscan.io/address/${contract.address}`}
            text={contract.address}
            style={styles.address}
          />
          <Text style={styles.title}>
            Owner Address
          </Text>
          <Link
            url={`https://rinkeby.etherscan.io/address/${contract.owner}`}
            text={contract.owner}
            style={styles.address}
          />
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
        <View style={styles.clear}>
          <Button
            title="Clear Browser Cache"
            color={Colors.red}
            onPress={this.props.resetApp}
          />
        </View>
        <TransactionPending pending={this.props.pending} />
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
    fontSize: 14,
    color: Colors.black,
    textAlign: 'right',
    paddingRight: 10,
  },
  statsValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.green,
  },
  clear: {
    marginTop: 20,
  },
});

const bindStore = (state) => {
  const isLoading = (state.app.loading === 'getLavaContract' || state.app.loading === 'refresh');

  return {
    user: state.user,
    contract: state.contract,
    loading: isLoading,
    error: isLoading ? state.app.error.message : '',
    pending: state.app.pending,
  };
};

const bindActions = dispatch => ({
  getLavaContract: () => dispatch(userActions.getLavaContract()),
  resetApp: () => dispatch(userActions.resetApp()),
  refresh: () => dispatch(userActions.refresh()),
});

export default connect(bindStore, bindActions)(DashboardScreen);
