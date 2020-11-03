import axios from "axios";

export const LOGOUT = "LOGOUT";

export function logout() {
  return (dispatch) => {
    axios
      .post("/logout")
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: LOGOUT,
          });
        } else {
          console.log(res);
        }
      })
      .catch((err) => console.error(err));
  };
}
