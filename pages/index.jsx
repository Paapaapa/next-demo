import { useEffect, useCallback } from "react";
import { Button, Tabs } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import getConfig from "next/config";
import Router, { withRouter } from "next/router";
import LRU from "lru-cache";
import Repo from "../components/Repo";
import { cacheArray } from "../lib/repo-basic-cache";

const { request } = require("../lib/api");

const {
  publicRuntimeConfig: { OAUTH_URL },
} = getConfig();

const isServer = typeof window === "undefined";

const cache = new LRU({
  maxAge: 1000 * 10,
});

const { TabPane } = Tabs;

// let cachedUserRepos, cachedUserStarredRepos;

function Index({ userRepos, userStarredRepos, user, router }) {
  if (!user || !user.id) {
    return (
      <div className="root">
        <p>尚未登录</p>
        <Button type="primary" href={OAUTH_URL}>
          点击登录
        </Button>
        <style jsx>
          {`
            .root {
              height: 400px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
          `}
        </style>
      </div>
    );
  }

  const activeTabKey = router.query.key || "1";

  const handleTabChange = useCallback((key) => {
    Router.push(`/?key=${key}`);
  }, []);

  useEffect(() => {
    if (!isServer) {
      // cachedUserRepos = userRepos;
      // cachedUserStarredRepos = userStarredRepos;

      if (userRepos) {
        cache.set("userRepos", userRepos);
        cacheArray(userRepos);
      }

      if (userStarredRepos) {
        cache.set("userStarredRepos", userStarredRepos);
        cacheArray(userStarredRepos);
      }
    }
  }, [userRepos, userStarredRepos]);

  return (
    <div className="root">
      <div className="user-info">
        <img src={user.avatar_url} alt={user.id} className="avatar" />
        <span className="login">{user.login}</span>
        <span className="name">{user.name}</span>
        <span className="bio">{user.bio}</span>
        <p className="email">
          <MailOutlined style={{ marginRight: 10 }} />
          <a href={`mailto:${user.email}`}>{user.email}</a>
        </p>
      </div>
      <div className="user-repos">
        <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
          <TabPane tab="你的仓库" key="1">
            {userRepos.map((repo) => (
              <Repo key={repo.id} repo={repo} />
            ))}
          </TabPane>
          <TabPane tab="你关注的仓库" key="2">
            {userStarredRepos.map((repo) => (
              <Repo key={repo.id} repo={repo} />
            ))}
          </TabPane>
        </Tabs>
      </div>

      <style jsx>{`
        .root {
          display: flex;
          align-items: flex-start;
          padding: 20px 0;
        }
        .user-info {
          width: 200px;
          margin-right: 40px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        .login {
          font-weight: 800;
          font-size: 20px;
          margin-top: 20px;
        }
        .name {
          font-size: 16px;
          color: #777;
        }
        .bio {
          margin-top: 20px;
          color: #333;
        }
        .avatar {
          width: 100%;
          border-radius: 4px;
        }
        .user-repos {
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
}

Index.getInitialProps = async ({ ctx, reduxStore }) => {
  const { user } = reduxStore.getState();

  if (!user || !user.id) {
    return {
      userRepos: [],
      userStarredRepos: [],
    };
  }

  if (!isServer && cache.get("userStarredRepos") && cache.get("userRepos")) {
    return {
      userRepos: cache.get("userRepos"),
      userStarredRepos: cache.get("userStarredRepos"),
    };
  }

  const userReposRes = await request(
    {
      url: "/user/repos",
    },
    ctx.req,
    ctx.res
  );

  const userStarredReposRes = await request(
    {
      url: "/user/starred",
    },
    ctx.req,
    ctx.res
  );

  return {
    userRepos: userReposRes.data || [],
    userStarredRepos: userStarredReposRes.data || [],
  };
};

export default withRouter(connect(({ user }) => ({ user }))(Index));
