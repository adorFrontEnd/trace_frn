

// This must be the first line in src/index.js
import 'react-app-polyfill/ie9';
import 'core-js/es6/array';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import store from './store/store';
import { Provider } from 'react-redux'

import * as serviceWorker from './serviceWorker';
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
  ,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();




