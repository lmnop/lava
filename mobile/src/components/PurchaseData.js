import React, { Component } from 'react';
import { StyleSheet, Button, TextInput, View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import Box from './Box';
import Loading from './Loading';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class PurchaseData extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: '',
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
          onChangeText={(data) => {
            this.setState({data});
          }}
          value={this.state.data}
          placeholder="Data in GBs"
          keyboardType="numeric"
        />
        <View style={styles.statsRow}>
          <Text style={styles.statsTitle}>
            Ether Per GB
          </Text>
          <Text style={styles.statsValue}>
            {`${this.props.etherPerGB} ether`}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalTitle}>
            Total
          </Text>
          <Text style={styles.totalValue}>
            {`${parseFloat(this.props.etherPerGB) * parseFloat(this.state.data)} ether`}
          </Text>
        </View>
        <Button
          title="Purchase"
          color={Colors.green}
          disabled={!this.state.data}
          onPress={() => {
            this.props.purchaseData(this.state.data);

            this.setState({
              data: '',
            });
          }}
        />
      </View>
    );
  }

  render() {
    return (
      <Box
        header="Purchase Data"
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
    etherPerGB: _.get(state.contract.parameters, 'etherPerGBEther.value', 0),
    loading: state.app.loading === 'purchaseData' ? true : false,
    error: state.app.error.action === 'purchaseData' ? state.app.error.message : '',
    pending: state.app.pending,
  };
};

const bindActions = dispatch => ({
  purchaseData: (data) => dispatch(userActions.purchaseData(data)),
});

export default connect(bindStore, bindActions)(PurchaseData);
