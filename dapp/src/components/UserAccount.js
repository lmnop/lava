import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';

import Box from './Box';

import { Colors } from '../constants';

function UserAccount(props) {
  return (
    <Box
      header="User Account"
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          Contract Balance
        </Text>
        <Text style={styles.balance}>
          {`${props.user.contract.blanceEther} ether`}
        </Text>
        <Text style={styles.title}>
          Available Data
        </Text>
        <Text style={styles.balance}>
          {`${props.user.contract.data / 1000000000} GB`}
        </Text>
      </View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
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
  balance: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.green,
  },
});

const bindStore = (state) => {
  return {
    user: state.user,
  };
};

export default connect(bindStore)(UserAccount);
