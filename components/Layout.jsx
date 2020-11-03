import { Layout, Avatar, Input, Tooltip, Dropdown, Menu } from "antd";
import { GithubOutlined, UserOutlined } from "@ant-design/icons";
import { useState, useCallback, useMemo, memo } from "react";
// import getConfig from 'next/config';
import { connect } from "react-redux";
// import axios from 'axios';
import Router, { withRouter } from "next/router";
import Link from "next/link";
import Container from "./Container";
import { logout } from "../store/actions";

const { Header, Footer, Content } = Layout;
const githubIconStyle = {
  color: "white",
  fontSize: 40,
  display: "block",
  paddingTop: 10,
  marginRight: 20,
};
const footerStyle = {
  textAlign: "center",
};
// const { publicRuntimeConfig: { OAUTH_URL } } = getConfig();

function MyLayout({ children, user, logout, router }) {
  const {
    query: { query: urlQuery },
  } = router;
  const [search, setSearch] = useState(urlQuery || "");

  const handleSearchChange = useCallback(
    (event) => {
      setSearch(event.target.value);
    },
    [setSearch]
  );

  const handleOnSearch = useCallback(() => {
    Router.push(`/search?query=${search}&page=1&per_page=20`);
  }, [search]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // const handleGotoOAuth = useCallback(e => {
  //   e.preventDefault();
  //   axios.get(`/prepare-auth?url=${router.asPath}`)
  //     .then(res => {
  //       if (res.status === 200) {
  //         location.href = OAUTH_URL;
  //       } else {
  //         console.log(res);
  //       }
  //     }).catch(err => console.error(err));
  // }, []);

  const userMenus = useMemo(
    () => (
      <Menu>
        <Menu.Item>
          <a href="javascript:void(0);" onClick={handleLogout}>
            退出登录
          </a>
        </Menu.Item>
      </Menu>
    ),
    [handleLogout]
  );

  return (
    <Layout>
      <Header>
        <Container renderer={<div className="header-inner" />}>
          <div className="header-left">
            <div className="logo">
              <Link href="/">
                <GithubOutlined style={githubIconStyle} />
              </Link>
            </div>
            <div>
              <Input.Search
                placeholder="搜索仓库"
                value={search}
                onChange={handleSearchChange}
                onSearch={handleOnSearch}
              />
            </div>
          </div>
          <div className="header-right">
            <div className="user">
              {user && user.id ? (
                <Dropdown overlay={userMenus}>
                  <a href="##">
                    <Avatar size={40} src={user.avatar_url} />
                  </a>
                </Dropdown>
              ) : (
                <Tooltip title="点击登录">
                  <a
                    href={`/prepare-auth?url=${router.asPath}`}
                    // onClick={handleGotoOAuth}
                  >
                    <Avatar size={40} icon={<UserOutlined />} />
                  </a>
                </Tooltip>
              )}
            </div>
          </div>
        </Container>
      </Header>

      <Content>
        <Container>{children}</Container>
      </Content>

      <Footer style={footerStyle}>
        Develop by ZYN @<a href="mailto:304752464@qq.com">304752464@qq.com</a>
      </Footer>

      <style jsx>
        {`
          .header-inner {
            display: flex;
            justify-content: space-between;
          }
          .header-left {
            display: flex;
            justify-content: flex-start;
          }
        `}
      </style>

      <style jsx global>
        {`
          #__next {
            height: 100%;
          }
          .ant-layout {
            min-height: 100%;
          }
          .ant-layout-header {
            padding-left: 0;
            padding-right: 0;
          }
          .ant-layout-content {
            background-color: #fff;
          }
        `}
      </style>
    </Layout>
  );
}

export default memo(
  connect(
    ({ user }) => ({
      user,
    }),
    (dispatch) => ({
      logout: () => dispatch(logout()),
    })
  )(withRouter(MyLayout))
);
