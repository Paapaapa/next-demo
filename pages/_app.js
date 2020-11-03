import App from "next/app";
import Router from "next/router";
import withReduxApp from "../components/WithRedux";
import Layout from "../components/Layout";
import PageLoading from "../components/PageLoading";

import "antd/dist/antd.css";
import "github-markdown-css";

class MyApp extends App {
  state = {
    loading: false,
  };

  startLoading = () => {
    this.setState({
      loading: true,
    });
  };

  stopLoading = () => {
    this.setState({
      loading: false,
    });
  };

  componentDidMount() {
    Router.events.on("routeChangeStart", this.startLoading);
    Router.events.on("routeChangeComplete", this.stopLoading);
    Router.events.on("routeChangeError", this.stopLoading);
  }

  componentWillUnmount() {
    Router.events.off("routeChangeStart", this.startLoading);
    Router.events.off("routeChangeComplete", this.stopLoading);
    Router.events.off("routeChangeError", this.stopLoading);
  }

  static async getInitialProps(ctx) {
    const { Component } = ctx;
    let pageProps;
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return {
      pageProps,
    };
  }

  render() {
    const { Component, pageProps } = this.props;
    const { loading } = this.state;

    return (
      <>
        {loading && <PageLoading />}
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </>
    );
  }
}

export default withReduxApp(MyApp);
