import 'node-libs-react-native/globals';
import React, { Component } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Provider } from 'react-redux';
import { AsyncStorage } from 'react-native';
import { persistStore } from 'redux-persist';

import configureStore from './store';

import RootNavigation from './navigation/RootNavigation';

const store = configureStore();

class App extends Component {

  constructor() {
    super();

    this.state = {
      loading: true,
    };
  }

  componentWillMount() {
    persistStore(store, {
      storage: AsyncStorage,
    }, () => {
      this.setState({
        loading: false,
      });
    });
  }

  render() {
    return (
      <Provider store={store}>
        <RootNavigation />
      </Provider>
    );
  }
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  body: {
    minHeight: height,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default App;
