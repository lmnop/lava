import React from 'react';
import { StyleSheet, Linking, Text, TouchableOpacity } from 'react-native';

import { Colors } from '../constants';

function Link(props) {
  return (
    <TouchableOpacity
      onPress={() => {
        Linking.openURL(props.url);
      }}
      style={[styles.container, props.style]}
    >
      <Text style={styles.text}>
        {props.text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: Colors.blue,
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '300',
    color: Colors.blue,
  },
});

export default Link;
