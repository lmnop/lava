import React from 'react';
import { Linking, TouchableOpacity } from 'react-native';

function Link(props) {
  return (
    <TouchableOpacity
      onPress={() => {
        Linking.openURL(props.url);
      }}
    >
      {props.children}
    </TouchableOpacity>
  );
}

export default Link;
