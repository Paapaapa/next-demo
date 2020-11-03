import { useEffect } from "react";
import Link from "next/link";
import { withRouter } from "next/router";
import { request } from "../lib/api";
import { getCache, setCache } from "../lib/repo-basic-cache";
import Repo from "./Repo";

const isServer = typeof window === "undefined";

function makeQuery(queryObj) {
  const query = Object.entries(queryObj)
    .reduce((result, entry) => {
      return [...result, entry.join("=")];
    }, [])
    .join("&");

  return `?${query}`;
}

export default function (Comp, type = "index") {
  const WithRepoBasic = ({ repoBasic, router: { query }, ...rest }) => {
    useEffect(() => {
      !isServer && setCache(repoBasic);
    }, [repoBasic]);

    return (
      <div className="root">
        <div className="repo-basic">
          <Repo repo={repoBasic} />
          <div className="tabs">
            {type === "index" ? (
              <span className="tab">ReadMe</span>
            ) : (
              <Link href={`/detail${makeQuery(query)}`}>
                <a className="tab index">ReadMe</a>
              </Link>
            )}
            {type === "issues" ? (
              <span className="tab">Issues</span>
            ) : (
              <Link href={`/detail/issues${makeQuery(query)}`}>
                <a className="tab issues">Issues</a>
              </Link>
            )}
          </div>
        </div>

        <div>
          <Comp {...rest} />
        </div>

        <style jsx>
          {`
            .root {
              padding-top: 20px;
            }
            .repo-basic {
              padding: 20px;
              border: 1px solid #eee;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            .tab + .tab {
              margin-left: 20px;
            }
          `}
        </style>
      </div>
    );
  };

  WithRepoBasic.getInitialProps = async (ctx) => {
    const {
      ctx: { req, res, query },
    } = ctx;
    const { owner, repo } = query;

    const full_name = `${owner}/${repo}`;

    let pageProps = {};
    if (Comp.getInitialProps) {
      pageProps = await Comp.getInitialProps(ctx);
    }

    if (!isServer && getCache(full_name)) {
      return {
        repoBasic: getCache(full_name),
        ...pageProps,
      };
    }

    const repoRes = await request(
      {
        url: `/repos/${owner}/${repo}`,
      },
      req,
      res
    );

    return {
      repoBasic: repoRes.data,
      ...pageProps,
    };
  };

  return withRouter(WithRepoBasic);
}
