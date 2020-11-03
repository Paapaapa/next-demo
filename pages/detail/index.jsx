import dynamic from "next/dynamic";
import withRepoBasic from "../../components/WithRepoBasic";
import { request } from "../../lib/api";

const MarkdownRenderer = dynamic(() =>
  import("../../components/MarkdownRenderer")
);

function Detail({ readMe }) {
  return <MarkdownRenderer content={readMe.content} isBase64 />;
}

Detail.getInitialProps = async ({
  ctx: {
    query: { owner, repo },
    res,
    req,
  },
}) => {
  const readMeRes = await request(
    {
      url: `/repos/${owner}/${repo}/readme`,
    },
    req,
    res
  );

  return {
    readMe: readMeRes.data,
  };
};

export default withRepoBasic(Detail, "index");
