// store.js
// import { createStore } from 'redux';
// import quizReducer from './reducers';

// const store = createStore(
//     quizReducer,
//     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
// );

// export default store;

import { configureStore } from '@reduxjs/toolkit';
import quizReducer from './reducers';

const store = configureStore({
    reducer: quizReducer,
    devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

export default store;

