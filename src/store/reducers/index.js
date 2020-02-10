// src/reducers/index.js

import { combineReducers } from 'redux';
import productsReducer from './products-reducer';
import routeReducer from './route-reducer';
import cartReducer from './cart-reducer';
import todoReducer from './todo-reducer';
import pagesReducer from './pages-reducer';

const allReducers = {
  products: productsReducer,
  storeRoute:routeReducer,
  pageStates:pagesReducer
}

const rootReducer = combineReducers(allReducers);


export default rootReducer;