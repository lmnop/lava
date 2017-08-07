import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '../constants';

function renderFooter(text) {
  if (text) {
    return (
      <Text style={styles.footer}>
        {text}
      </Text>
    );
  }

  return <View style={styles.blank} />;
}

function Box(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {props.header}
      </Text>
      <View style={styles.body}>
        {props.children}
      </View>
      {renderFooter(props.footer)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  header: {
    padding: 10,
    zIndex: 10,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: -18,
    backgroundColor: Colors.white,
    color: Colors.black,
  },
  body: {
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.black,
    borderWidth: 2,
    padding: 20,
  },
  footer: {
    padding: 10,
    zIndex: 10,
    lineHeight: 16,
    fontSize: 14,
    fontWeight: '700',
    marginTop: -20,
    backgroundColor: Colors.white,
    color: Colors.red,
  },
  blank: {
    height: 36,
    zIndex: 10,
    marginTop: -20,
  }
});

export default Box;
