import { memo, useState, useCallback, useRef } from "react";
import { Select, Spin } from "antd";
import debounce from "lodash/debounce";
import { request } from "../lib/api";

const { Option } = Select;

function SearchUser({ onChange, value }) {
  // 标识是否为当前轮次查询，否则取抛弃以往轮次查询结果
  const lastFetchIdRef = useRef(0);

  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);

  const fetchUser = useCallback(
    debounce((value) => {
      console.log("fetching user", value);

      lastFetchIdRef.current += 1;
      const fetchId = lastFetchIdRef.current;

      setFetching(true);
      setOptions([]);

      request({
        url: `/search/users?q=${value}`,
      }).then((res) => {
        console.log("res", res);

        // 对比查询轮次id
        if (fetchId !== lastFetchIdRef.current) {
          return;
        }

        const data = res.data.items.map((user) => ({
          text: user.login,
          value: user.login,
        }));

        setFetching(false);
        setOptions(data);
      });
    }, 500),
    []
  );

  const handleChange = (value) => {
    setOptions([]);
    setFetching(false);
    onChange(value);
  };

  return (
    <Select
      showSearch
      notFoundContent={
        fetching ? <Spin size="small" /> : <span>nothing found</span>
      }
      filterOption={false}
      placeholder="创建者"
      value={value}
      onChange={handleChange}
      onSearch={fetchUser}
      allowClear
      style={{ width: 200 }}
    >
      {options.map((op) => (
        <Option value={op.value} key={op.value}>
          {op.text}
        </Option>
      ))}
    </Select>
  );
}

export default memo(SearchUser);
