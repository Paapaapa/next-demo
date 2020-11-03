import { LOGOUT } from "./actions";

function user(state = {}, { type }) {
  switch (type) {
    case LOGOUT:
      return {};
    default:
      return state;
  }
}

export default {
  user,
};
