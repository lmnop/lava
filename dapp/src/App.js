import React, { Component } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Provider } from 'react-redux';
import { AsyncStorage } from 'react-native';
import { persistStore } from 'redux-persist';

import Header from './components/Header';
import Footer from './components/Footer';
import Router from './components/Router';
import Loading from './components/Loading';

import configureStore from './store';

const store = configureStore();

class App extends Component {

  constructor() {
    super();

    this.state = {
      rehydrated: false,
    };
  }

  componentWillMount() {
    persistStore(store, {
      storage: AsyncStorage,
    }, () => {
      this.setState({
        rehydrated: true,
      });
    });
  }

  render() {
    if (!this.state.rehydrated) {
      return <Loading />;
    }

    return (
      <Provider store={store}>
        <View style={styles.container}>
          <Header />
          <View style={styles.body}>
            <Router />
          </View>
          <Footer />
        </View>
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
