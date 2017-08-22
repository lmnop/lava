import React from 'react';
import { StyleSheet, View, Text, ProgressBar } from 'react-native';

import Link from './Link';

import { Colors } from '../constants';

function TransactionPending(props) {
  if (props.pending) {
    return (
      <View style={styles.container}>
        <ProgressBar
          indeterminate={true}
          color={Colors.darkGrey}
          trackColor={Colors.grey}
          style={styles.bar}
        />
        <View style={styles.inner}>
          <Text style={styles.text}>
            PENDING TRANSACTION HASH
          </Text>
          <Link
            url={`https://rinkeby.etherscan.io/tx/${props.pending}`}
            text={props.pending}
            style={styles.address}
          />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    bottom: 0,
    height: 80,
    width: '100%',
    zIndex: 1000,
  },
  bar: {
    position: 'fixed',
    bottom: 0,
    height: 80,
    width: '100%',
    zIndex: 1000,
  },
  inner: {
    position: 'fixed',
    bottom: 0,
    height: 80,
    width: '100%',
    zIndex: 1001,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.white,
  },
  address: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default TransactionPending;
