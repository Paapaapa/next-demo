import { memo, isValidElement, useEffect } from "react";
import { Row, Col, List, Pagination } from "antd";
import { withRouter } from "next/router";
import Link from "next/link";
import Repo from "../components/Repo";
import { cacheArray } from "../lib/repo-basic-cache";

const { request } = require("../lib/api");
const LANGUAGES = ["JavaScript", "HTML", "CSS", "TypeScript", "Java", "Rust"];
const SORT_TYPES = [
  {
    name: "Best Match",
  },
  {
    name: "Most Stars",
    value: "stars",
    order: "desc",
  },
  {
    name: "Fewest Stars",
    value: "stars",
    order: "asc",
  },
  {
    name: "Most Forks",
    value: "forks",
    order: "desc",
  },
  {
    name: "Fewest Stars",
    value: "forks",
    order: "asc",
  },
];
const selectedItemStyle = {
  borderLeft: "2px solid #e36209",
  fontWeight: 100,
};
const isServer = typeof window === "undefined";

const FilterLink = memo(({ name, ...queries }) => {
  const {
    query = "",
    lang = "",
    sort = "",
    order = "desc",
    page = 1,
  } = queries;
  let queryString = `?query=${query}`;
  if (lang) queryString += `&lang=${lang}`;
  if (sort) queryString += `&sort=${sort}&order=${order}`;
  if (page) queryString += `&page=${page}`;

  queryString += "&per_page=20";

  return (
    <Link href={`/search${queryString}`}>
      {isValidElement(name) ? name : <a>{name}</a>}
    </Link>
  );
});

function Search({ router, repos }) {
  const {
    query: { sort, order, lang, page, per_page },
    query,
  } = router;

  useEffect(() => {
    !isServer && cacheArray(repos.items);
  }, [repos]);

  return (
    <div className="root">
      <Row gutter={20}>
        <Col span={6}>
          <List
            bordered
            header={<span className="list-header">语言</span>}
            style={{ marginBottom: 20 }}
            dataSource={LANGUAGES}
            renderItem={(item) => {
              const selected = lang === item;

              return (
                <List.Item style={selected ? selectedItemStyle : null}>
                  {selected ? (
                    <span>{item}</span>
                  ) : (
                    <FilterLink name={item} {...query} lang={item} />
                  )}
                </List.Item>
              );
            }}
          />
          <List
            bordered
            header={<span className="list-header">排序</span>}
            dataSource={SORT_TYPES}
            renderItem={(item) => {
              let selected = false;
              if (item.name === "Best Match" && !query.sort) {
                selected = true;
              } else if (item.value === sort && item.order === order) {
                selected = true;
              }

              return (
                <List.Item style={selected ? selectedItemStyle : null}>
                  {selected ? (
                    <span>{item.name}</span>
                  ) : (
                    <FilterLink
                      name={item.name}
                      {...query}
                      sort={item.value || ""}
                      order={item.order || ""}
                    />
                  )}
                </List.Item>
              );
            }}
          />
        </Col>

        <Col span={18}>
          <h3 className="repos-title">{repos.total_count} 个仓库</h3>
          {repos.items.map((repo) => (
            <Repo key={repo.id} repo={repo} />
          ))}
          <div className="pagination">
            <Pagination
              showSizeChanger={false}
              pageSize={Number(per_page)}
              current={Number(page) || 1}
              // 由于github接口限制，最多获取1000条数据
              total={Math.min(repos.total_count, 1000)}
              itemRender={(page, type, ol) => {
                const p =
                  type === "page"
                    ? page
                    : type === "prev"
                    ? page - 1
                    : page + 1;
                const name = type === "page" ? page : ol;

                return <FilterLink name={name} {...query} page={p} />;
              }}
            />
          </div>
        </Col>
      </Row>

      <style jsx>
        {`
          .root {
            padding: 20px 0;
          }
          .list-header {
            font-weight: 800;
            font-size: 16px;
          }
          .repos-title {
            border-bottom: 1px solid #eee;
            font-size: 24px;
            line-height: 50px;
          }
          .pagination {
            padding: 20px;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
}

Search.getInitialProps = async ({ ctx }) => {
  const {
    query: { query, sort, lang, order, page, per_page },
    req,
    res,
  } = ctx;

  if (!query) {
    return {
      repos: {
        total_count: 0,
        items: [],
      },
    };
  }

  let queryString = `?q=${query}`;
  if (lang) queryString += `+language:${lang}`;
  if (sort) queryString += `&sort=${sort}&order=${order || "desc"}`;
  if (page) queryString += `&page=${page}`;

  queryString += `&per_page=${per_page}`;

  const result = await request(
    {
      url: `/search/repositories${queryString}`,
    },
    req,
    res
  );

  return {
    repos: result.data,
  };
};

export default withRouter(Search);
