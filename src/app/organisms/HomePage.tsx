import { useMemo } from "react";
import { useAppSelector } from "../lib/hooks";
import PostCardComponent from "../components/PostCardComponent";
import PostCardSpinnerGroup from "../spinners/PostCardSpinnerGroup";
import CreateFormPost from "../components/CreatePostForm";
import MobileOptionFullScreenModal from "../modali/MobileOptionFullScreenModal";
import ThreeDotSpinner from "../spinners/ThreeDotSpinner";

const HomePage = () => {
  const accountsFromRedux = useAppSelector(state => state.sessionGeneratedAccounts.acc);
  const userpost = useAppSelector( state => state.posts.userPosts)
  const postArray = useMemo(() => {
    const returnArray = accountsFromRedux.flatMap(accounts => accounts.posts)
    returnArray.push(...userpost)
    returnArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return returnArray
  }, [accountsFromRedux, userpost]);

  return (
    <div className="container-fluid">
      <MobileOptionFullScreenModal/>
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6 py-3 d-flex flex-column align-items-center justify-content-center gap-2">
          {postArray.length === 0 ? '' : <CreateFormPost/>}
          {postArray.length === 0 ? (
            <PostCardSpinnerGroup/>
          ) : (
            <>
              {postArray.map((post) => (
                <PostCardComponent key={`${post.id}${post.author.userName}`} post={post} />
              ))}
              <ThreeDotSpinner/>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default HomePage;
