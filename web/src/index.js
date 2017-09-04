import { AppRegistry } from 'react-native';

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

AppRegistry.registerComponent('Lava', () => App);
AppRegistry.runApplication('Lava', { rootTag: document.getElementById('root') });

registerServiceWorker();
