import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '../constants';

function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        LAVA
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 4,
    color: Colors.red,
  },
});

export default Header;
