import { Provider } from "react-redux";
import { getOrCreateStore } from "../store/store";

const isServer = typeof window === "undefined";

export default (CustomeApp) => {
  class WithReduxApp extends React.Component {
    constructor(props) {
      super(props);
      this.reduxStore = getOrCreateStore(props.initReduxState);
    }

    static async getInitialProps(ctx) {
      let reduxStore;

      if (isServer) {
        const {
          ctx: { req },
        } = ctx;
        const { session } = req;

        if (session && session.userInfo) {
          reduxStore = getOrCreateStore({ user: session.userInfo });
        } else {
          reduxStore = getOrCreateStore();
        }
      } else {
        reduxStore = getOrCreateStore();
      }

      ctx.reduxStore = reduxStore;

      let appProps = {};

      if (typeof CustomeApp.getInitialProps === "function") {
        appProps = await CustomeApp.getInitialProps(ctx);
      }

      return {
        ...appProps,
        initReduxState: reduxStore.getState(),
      };
    }

    render() {
      const { ...rest } = this.props;

      return (
        <Provider store={this.reduxStore}>
          <CustomeApp {...rest} />
        </Provider>
      );
    }
  }

  return WithReduxApp;
};
