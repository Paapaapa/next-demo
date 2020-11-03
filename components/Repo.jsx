import { StarFilled } from "@ant-design/icons";
import { memo } from "react";
import Link from "next/link";
import { getLastUpdated } from "../lib/utils";

function getLicense(license) {
  return license ? `${license.spdx_id} license` : "";
}

function Repo({ repo }) {
  return (
    <div className="root">
      <div className="basic-info">
        <h3 className="repo-title">
          <Link href={`/detail?owner=${repo.owner.login}&repo=${repo.name}`}>
            <a>{repo.full_name}</a>
          </Link>
        </h3>
        <p className="repo-desc">{repo.description}</p>
        <p className="other-info">
          {repo.license && (
            <span className="license">{getLicense(repo.license)}</span>
          )}
          <span className="last-updated">
            {getLastUpdated(repo.updated_at)}
          </span>
          <span className="open-issues">
            {repo.open_issues_count} open issues
          </span>
        </p>
      </div>
      <div className="lang-star">
        <span className="lang">{repo.language}</span>
        <span className="stars">
          {repo.stargazers_count}
          <StarFilled style={{ marginLeft: 6 }} />
        </span>
      </div>

      <style jsx>{`
        .root {
          display: flex;
          justify-content: space-between;
        }
        .root + .root {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .repo-title {
          font-size: 20px;
        }
        .repo-desc {
          width: 400px;
        }
        .other-info > span + span {
          margin-left: 10px;
        }
        .lang-star {
          display: flex;
        }
        .lang-star > span {
          width: 120px;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export default memo(Repo);