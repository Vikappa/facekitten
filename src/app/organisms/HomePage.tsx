import { use, useMemo } from "react";
import { useAppSelector } from "../lib/hooks";
import PostCardComponent from "../components/PostCardComponent";
import PostCardSpinnerGroup from "../spinners/PostCardSpinnerGroup";
import CreateFormPost from "../components/CreatePostForm";
import MobileOptionFullScreenModal from "../modali/MobileOptionFullScreenModal";
import ThreeDotSpinner from "../spinners/ThreeDotSpinner";

const HomePage = () => {
  const accountsFromRedux = useAppSelector(state => state.sessionGeneratedAccounts.acc);
  const userpost = useAppSelector( state => state.posts.userPosts)
  const userName = useAppSelector( state => state.userCredentials.userName)
  const postArray = useMemo(() => {
    const returnArray = accountsFromRedux.flatMap(accounts => accounts.posts)
    returnArray.push(...userpost)
    returnArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return returnArray
  }, [accountsFromRedux, userpost]);

  return (
    <div className="container-fluid">
      <MobileOptionFullScreenModal/>
      <div className="row">
        
        <div className="col-0 col-md-3 d-none d-md-block">
          <ul>
            <li>{userName}</li>
            <li>Friends</li>
            <li>Memories</li>
            <li>Saved</li>
            <li>Groups</li>
            <li>Video</li>
            <li>Marketplace</li>
            <li>Feed</li>
          </ul>
        </div>

        <div className="col-12 col-md-9 col-lg-6 py-3 d-flex flex-column align-items-center justify-content-center gap-2">

          {postArray && postArray.length === 0 ? '' : <CreateFormPost/>}
          {postArray && postArray.length === 0 ? (
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

        <div className="col-0 col-lg-3">
          <ul>
            <li>
              Birthdays
            </li>

            <ul>
              <li>
                Contacts
              </li>
            </ul>
          </ul>
        </div>

      </div>
    </div>
  );
};
export default HomePage;
