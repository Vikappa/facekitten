import { useMemo } from "react";
import { useAppSelector } from "../lib/hooks";
import PostCardComponent from "../components/PostCardComponent";

const HomePage = () => {
  const accountsFromRedux = useAppSelector(state => state.sessionGeneratedAccounts.acc);

  const postArray = useMemo(() => {
    const returnArray = accountsFromRedux.flatMap(accounts => accounts.posts)
    returnArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return returnArray
  }, [accountsFromRedux]);

  return (
    <div className="row">
      <div className="col-lg-3"></div>
      <div className="col-12 col-md-9 col-lg-6 p-3">
        {postArray.length === 0 ? (
          `carico`
        ) : (
          postArray.map((post) => (
            <PostCardComponent key={post.id} post={post} />
          ))
        )}
      </div>
      <div className="col-0 col-md-3"></div>
    </div>
  );
};

export default HomePage;
