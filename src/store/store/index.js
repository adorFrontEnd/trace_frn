
import { createStore } from "redux";
import rootReducer from '../reducers/index';
import { composeWithDevToos } from 'redux-devtools-extension';
// const store = createStore(rootReducer,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
const store = createStore(rootReducer);

export default store;

