import { useCallback, useState, useEffect } from "react";
import { Avatar, Button, Select, Spin } from "antd";
import dynamic from "next/dynamic";
import withRepoBasic from "../../components/WithRepoBasic";
import { request } from "../../lib/api";
import { getLastUpdated } from "../../lib/utils";
import SearchUser from "../../components/SearchUser";

const MarkdownRenderer = dynamic(() =>
  import("../../components/MarkdownRenderer")
);

const isServer = typeof window === "undefined";

const CACHE = {};

const { Option } = Select;

function IssueDetail({ issue }) {
  return (
    <div className="root">
      <MarkdownRenderer content={issue.body} />
      <div className="actions">
        <Button href={issue.html_url} target="_blank">
          打开Issue讨论页面
        </Button>
      </div>

      <style jsx>
        {`
          .root {
            background-color: #fefefe;
            padding: 20px;
          }
          .actions {
            text-align: right;
          }
        `}
      </style>
    </div>
  );
}

function Label({ label }) {
  return (
    <>
      <span className="label" style={{ backgroundColor: `#${label.color}` }}>
        {label.name}
      </span>
      <style jsx>
        {`
          .label {
            display: inline-block;
            line-height: 20px;
            margin-left: 15px;
            padding: 3px 10px;
            border-radius: 3px;
            font-size: 14px;
          }
        `}
      </style>
    </>
  );
}

function IssueItem({ issue }) {
  const [showDetail, setShowDetail] = useState(false);

  const toggleShowDetail = useCallback(() => {
    setShowDetail((detail) => !detail);
  }, []);

  return (
    <div>
      <div className="issue">
        <Button
          type="primary"
          size="small"
          style={{ position: "absolute", right: 10, top: 10 }}
          onClick={toggleShowDetail}
        >
          {showDetail ? "隐藏" : "查看"}
        </Button>
        <div className="avatar">
          <Avatar src={issue.user.avatar_url} share="square" size={50} />
        </div>
        <div className="main-info">
          <h6>
            <span>{issue.title}</span>
            {issue.labels.map((label) => (
              <Label key={label.id} label={label.name} />
            ))}
          </h6>
          <p className="sub-info">
            <span>Updated at {getLastUpdated(issue.updated_at)}</span>
          </p>
        </div>
      </div>

      {showDetail ? <IssueDetail issue={issue} /> : null}

      <style jsx>
        {`
          .issue {
            display: flex;
            position: relative;
            padding: 10px;
          }
          .issue:hover {
            background-color: #fafafa;
          }
          .issue + .issue {
            border-top: 1px solid #eee;
          }
          .main-info > h6 {
            max-width: 600px;
            font-size: 16px;
            margin-right: 40px;
          }
          .avatar {
            margin-right: 20px;
          }
          .sub-info {
            margin-bottom: 0;
          }
          .sub-info > span + span {
            display: inline-block;
            margin-left: 20px;
            font-size: 12px;
          }
        `}
      </style>
    </div>
  );
}

function makeQuery(creator, status, label) {
  let creatorStr = creator ? `creator=${creator}` : "";
  let statusStr = status ? `status=${status}` : "";
  let labelStr = label && label.length > 0 ? `labels=${label.join(",")}` : "";

  const arr = [];

  creatorStr && arr.push(creatorStr);
  statusStr && arr.push(statusStr);
  labelStr && arr.push(labelStr);

  return `?${arr.join("&")}`;
}

function Issues({ owner, repo, initialIssues, labels }) {
  const [creator, setCreator] = useState();
  const [status, setStatus] = useState();
  const [label, setLabel] = useState([]);
  const [issues, setIssues] = useState(initialIssues);
  const [fetching, setFetching] = useState(false);

  const handleCreatorChange = useCallback((value) => {
    setCreator(value);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatus(value);
  }, []);

  const handleLabelChange = useCallback((value) => {
    setLabel(value);
  }, []);

  useEffect(() => {
    !isServer && (CACHE[`${owner}/${repo}`] = labels);
  }, [owner, repo, labels]);

  const handleSearch = useCallback(() => {
    setFetching(true);
    request({
      url: `/repos/${owner}/${repo}/issues${makeQuery(creator, status, label)}`,
    })
      .then((res) => {
        setFetching(false);
        setIssues(res.data);
      })
      .catch((err) => {
        console.error(err);
        setFetching(false);
      });
  }, [owner, repo, creator, status, label]);

  return (
    <div className="root">
      <div className="search">
        <SearchUser onChange={handleCreatorChange} value={creator} />

        <Select
          placeholder="状态"
          onChange={handleStatusChange}
          value={status}
          style={{ width: 200, marginLeft: 20 }}
        >
          <Option key="all">all</Option>
          <Option key="open">open</Option>
          <Option key="closed">closed</Option>
        </Select>

        <Select
          mode="multiple"
          placeholder="标签"
          onChange={handleLabelChange}
          value={label}
          style={{ flexGrow: 1, width: 200, marginLeft: 20, marginRight: 20 }}
        >
          {labels.map((la) => (
            <Option key={la.id} value={la.name}>
              {la.name}
            </Option>
          ))}
        </Select>

        <Button type="primary" disabled={fetching} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      {fetching ? (
        <div className="loading">
          <Spin />
        </div>
      ) : (
        <div className="issues">
          {issues.map((issue) => (
            <IssueItem key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      <style jsx>
        {`
          .root {
            padding-top: 20px;
          }
          .issues {
            border: 1px solid #eee;
            border-radius: 5px;
            margin-bottom: 20px;
            margin-top: 20px;
          }
          .search {
            display: flex;
          }
          .loading {
            height: 400px;
            display: flex;
            align-item: center;
            justify-content: center;
          }
        `}
      </style>
    </div>
  );
}

Issues.getInitialProps = async ({
  ctx: {
    query: { owner, repo },
    req,
    res,
  },
}) => {
  const full_name = `${owner}/${repo}`;
  const [issuesRes, labelsRes] = await Promise.all([
    request(
      {
        url: `/repos/${owner}/${repo}/issues`,
      },
      req,
      res
    ),
    CACHE[full_name]
      ? Promise.resolve({ data: CACHE[full_name] })
      : request(
          {
            url: `/repos/${owner}/${repo}/labels`,
          },
          req,
          res
        ),
  ]);

  return {
    owner,
    repo,
    initialIssues: issuesRes.data,
    labels: labelsRes.data,
  };
};

export default withRepoBasic(Issues, "issues");
