import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

import { Colors } from '../constants';

function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        animating={true}
        color={Colors.red}
        hidesWhenStopped={true}
        size={80}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loading;
