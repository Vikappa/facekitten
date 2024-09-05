import { useMemo } from "react";
import { useAppSelector } from "../lib/hooks";
import PostCardComponent from "../components/PostCardComponent";
import PostCardSpinnerGroup from "../spinners/PostCardSpinnerGroup";
import CreateFormPost from "../components/CreatePostForm";

const HomePage = () => {
  const accountsFromRedux = useAppSelector(state => state.sessionGeneratedAccounts.acc);

  const postArray = useMemo(() => {
    const returnArray = accountsFromRedux.flatMap(accounts => accounts.posts)
    returnArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return returnArray
  }, [accountsFromRedux]);

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6 py-3 d-flex flex-column align-items-center justify-content-center gap-2">
          {postArray.length === 0 ?'': <CreateFormPost/>}
          {postArray.length === 0 ? 
            <PostCardSpinnerGroup/>
           : 
            postArray.map((post) => (
              <PostCardComponent key={post.id} post={post} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
