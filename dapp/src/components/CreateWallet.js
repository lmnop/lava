import React, { Component } from 'react';
import { StyleSheet, View, Button, Text, TextInput } from 'react-native';
import bip39 from 'bip39';
import { connect } from 'react-redux';

import { Colors } from '../constants';

import * as userActions from '../actions/user';

class CreateWallet extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mnemonic: '',
      error: '',
    };
  }

  checkMnemonic(mnemonic) {
    if (mnemonic.trim().split(/\s+/g).length >= 12) {
      if (bip39.validateMnemonic(mnemonic)) {
        this.props.useWallet(mnemonic);

        this.setState({
          error: '',
        });
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
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
});

const bindActions = dispatch => ({
  useWallet: (mnemonic) => dispatch(userActions.useWallet(mnemonic)),
});

export default connect(null, bindActions)(CreateWallet);
