import { Button } from 'antd';
import { connect } from 'react-redux';
import { ADD } from '../store/actions';
import styles from '../test.module.css';
import getConfig from 'next/config';

function Index({ count, add }) {
  const { publicRuntimeConfig: { OAUTH_URL } } = getConfig();

  return (
    <>
      <Button className={styles.red} onClick={add}>{count}</Button>
      <a href={OAUTH_URL}>登录</a>
    </>
  );
}

export default connect(({ count }) => ({
  count
}), dispatch => ({
  add: () => dispatch({ type: ADD })
}))(Index);