import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rootReducer from "../Reducers";

const Store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

export const getStoreState = (store) => {
    store = store || Store;
    return (store.getState && store.getState()) || {};
}

export default Store;
