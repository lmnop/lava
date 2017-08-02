import React, { Component } from 'react';
import { StyleSheet, View, Button, Text, TextInput } from 'react-native';
import bip39 from 'bip39';
import HDWalletProvider from 'truffle-hdwallet-provider';

import { Colors } from './constants';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mnemonic: '',
      address: '',
      error: '',
    };
  }

  createHDWallet(mnemonic) {
    this.provider = new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/sRC4zPiAwdx1VP1Zi1jq');
    //this.web3 = new Web3(this.provider);

    this.setState({
      address: this.provider.address,
      error: '',
    });
  }

  checkMnemonic(mnemonic) {
    if (mnemonic.trim().split(/\s+/g).length >= 12) {
      if (bip39.validateMnemonic(mnemonic)) {
        this.createHDWallet(mnemonic);
      } else {
        this.setState({
          error: 'mnemonic phrase is invalid',
        });
      }
    } else {
      this.setState({
        error: 'mnemonic phrase needs to be 12 words',
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            LAVA
          </Text>
        </View>
        <View style={styles.body}>
          <View style={styles.box}>
            <Button
              title="Generate Mnemonic Phrase"
              color={Colors.blue}
              onPress={() => {
                this.setState({
                  mnemonic: bip39.generateMnemonic(),
                });
              }}
            />
          </View>
          <Text style={styles.orText}>
            OR
          </Text>
          <View style={styles.box}>
            <Text style={styles.boxHeaderText}>
              Enter Mnemonic Phrase
            </Text>
            <TextInput
              style={styles.mnemonic}
              onChangeText={(mnemonic) => this.setState({mnemonic})}
              value={this.state.mnemonic}
              multiline={true}
            />
            <Text style={styles.boxFooterText}>
              Keep Secret - Keep Safe
            </Text>
          </View>
          <Text style={styles.errorText}>
            {this.state.error}
          </Text>
          <View style={styles.box}>
            <Button
              title="Use Wallet"
              color={Colors.green}
              disabled={!this.state.mnemonic}
              onPress={() => this.checkMnemonic(this.state.mnemonic)}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            L M N O P
          </Text>
          <Text style={styles.footerText}>
            wireless 3.0 - The People's Network
          </Text>
          <Text style={styles.footerText}>
            be bold. be humble. be open.
          </Text>
          <Text style={styles.footerLink}>
            connect@lmnop.network
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 4,
    color: Colors.red,
  },
  body: {
    flex: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  boxHeaderText: {
    padding: 10,
    zIndex: 10,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: -18,
    backgroundColor: Colors.white,
    color: Colors.black,
  },
  boxFooterText: {
    padding: 10,
    zIndex: 10,
    fontSize: 14,
    fontWeight: '700',
    marginTop: -20,
    backgroundColor: Colors.white,
    color: Colors.red,
  },
  orText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  mnemonic: {
    width: 300,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.black,
    borderWidth: 2,
    padding: 20,
  },
  mnemonicText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.red,
    lineHeight: 20,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  input: {
    width: 220,
    height: 80,
  },
  errorText: {
    height: 30,
    fontSize: 12,
    color: Colors.red,
    textAlign: 'center',
  },
  footer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerTitle: {
    margin: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  footerText: {
    margin: 4,
    fontSize: 12,
    color: Colors.black,
  },
  footerLink: {
    margin: 4,
    fontSize: 12,
    color: Colors.blue,
  },
});

export default App;
