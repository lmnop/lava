import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '../constants';

function Footer() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        L M N O P
      </Text>
      <Text style={styles.text}>
        wireless 3.0 - The People's Network
      </Text>
      <Text style={styles.text}>
        be bold. be humble. be open.
      </Text>
      <Text style={styles.link}>
        connect@lmnop.network
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    margin: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  text: {
    margin: 4,
    fontSize: 12,
    color: Colors.black,
  },
  link: {
    margin: 4,
    fontSize: 12,
    color: Colors.blue,
  },
});

export default Footer;
