import 'node-libs-react-native/globals';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import bip39 from 'react-native-bip39';
import HDWalletProvider from 'truffle-hdwallet-provider';
import contract from 'truffle-contract';

const generateMnemonic = async () => {
  try {
    return await bip39.generateMnemonic();
  } catch(e) {
    console.log('ERROR', e);
    return false
  }
}

export default class lava extends Component {
  async componentDidMount() {
    const mnemonic = await generateMnemonic();

    console.log('mnemonic', mnemonic);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
