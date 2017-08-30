import React, { Component } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { connect } from 'react-redux';

import Box from './Box';
import Loading from './Loading';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class SIM extends Component {

  renderPending() {
    if (this.props.sim.updateStatus) {
      return (
        <Text style={styles.pending}>
          Pending Status
        </Text>
      );
    }
  }

  renderContent() {
    if (this.props.loading || this.props.pending) {
      return (
        <View style={styles.container}>
          <Loading />
        </View>
      );
    }

    const isActive = this.props.sim.twilio.status === 'active';

    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Status
        </Text>
        <Text style={styles.status}>
          {this.props.sim.twilio.status}
        </Text>
        {this.renderPending()}
        <Text style={styles.title}>
          Data Consumed
        </Text>
        <Text style={styles.data}>
          {parseFloat(this.props.sim.dataConsumed) / 1000} GB
        </Text>
        <Text style={styles.title}>
          Data Paid
        </Text>
        <Text style={styles.data}>
          {parseFloat(this.props.sim.dataPaid) / 1000} GB
        </Text>
        <Button
          title={isActive ? 'Deactivate' : 'Activate'}
          color={isActive ? Colors.red : Colors.green}
          disabled={this.props.sim.updateStatus}
          onPress={() => {
            this.props.flipSIMStatus(this.props.sim);
          }}
        />
      </View>
    );
  }

  render() {
    return (
      <Box
        header={this.props.sim.twilio.iccid}
        footer={this.props.error}
      >
        {this.renderContent()}
      </Box>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.black,
  },
  status: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.green,
  },
  pending: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.red,
  },
  data: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.blue,
  },
});

const bindStore = (state) => {
  return {
    loading: state.app.loading === 'flipSIMStatus',
    error: state.app.error.action === 'flipSIMStatus' ? state.app.error.message : '',
    pending: state.app.pending,
  };
};

const bindActions = dispatch => ({
  flipSIMStatus: (sim) => dispatch(userActions.flipSIMStatus(sim)),
});

export default connect(bindStore, bindActions)(SIM);
