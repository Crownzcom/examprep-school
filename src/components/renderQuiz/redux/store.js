// store.js
import { createStore } from 'redux';
import quizReducer from './reducers';

const store = createStore(
    quizReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
