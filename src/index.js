import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import allReducers from './reducers';
import Routes from './routes';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

// TODO: Remove when done with project!
// import { composeWithDevTools } from 'redux-devtools-extension';

// const loggerMiddleware = createLogger();

// const store = createStore(allReducers, composeWithDevTools(
// 	applyMiddleware(
//     thunkMiddleware,
//     loggerMiddleware
//   )
// ));

const store = createStore(allReducers, applyMiddleware(thunkMiddleware));

ReactDOM.render(
  <Provider store={store}>
    <Routes history={browserHistory} />
  </Provider>, 
  document.getElementById('root')
); 
