import { createStore, combineReducers, applyMiddleware } from "redux";
import ReduxThunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import reducers from "./reducers";

const userInitState = {};

export const WINDOW_REDUX_STORE = "__WINDOW_REDUX_STORE__";

const isServer = typeof window === "undefined";

function initialStore(state) {
  return createStore(
    combineReducers(reducers),
    {
      user: userInitState,
      ...state,
    },
    composeWithDevTools(applyMiddleware(ReduxThunk))
  );
}

export function getOrCreateStore(initState) {
  if (isServer) {
    return initialStore(initState);
  }

  if (!window[WINDOW_REDUX_STORE]) {
    window[WINDOW_REDUX_STORE] = initialStore(initState);
  }

  return window[WINDOW_REDUX_STORE];
}
