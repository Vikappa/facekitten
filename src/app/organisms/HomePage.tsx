'use client'
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import PostCardComponent from "../components/PostCardComponent";
import PostCardSpinnerGroup from "../spinners/PostCardSpinnerGroup";
import CreateFormPost from "../components/CreatePostForm";
import MobileOptionFullScreenModal from "../modali/MobileOptionFullScreenModal";
import { addPostToAccount, randomCommentsOnExistingPost } from "../lib/slices/sessionGeneratedAccountsSlice";
import { CasualUser, Post } from "../utils/StorageDataTypes";
import ThreeDotSpinner from "../spinners/ThreeDotSpinner";

const HomePage = () => {
  const accountsFromRedux = useAppSelector(state => state.sessionGeneratedAccounts.acc);
  const userpost = useAppSelector( state => state.posts.userPosts)
  const dispatch = useAppDispatch()

  const postArray = useMemo(() => {
    const returnArray = accountsFromRedux.flatMap(accounts => accounts.posts)
    returnArray.push(...userpost)
    returnArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return returnArray
  }, [accountsFromRedux, userpost]);

  const [shownPost, setShowPost ] = useState<number>(6)

  const loadMorePosts = () => {
    setShowPost(prev => prev + 6)
  }

  const RefreshAccountsPosts = async (accounts: CasualUser[]) => {
    accounts.forEach(async account => {
        dispatch(addPostToAccount({
            editedAccount: account
        }))

        account.posts.forEach((post: Post) => {
            dispatch(randomCommentsOnExistingPost({editedAccount:account, editedPost:post}))
        })
    })
}
  

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMorePosts();
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if(shownPost >= userpost.length){
      RefreshAccountsPosts(accountsFromRedux)
    }
  }, [shownPost, userpost.length, accountsFromRedux])
  

  return (
    <div className="container-fluid">
      <MobileOptionFullScreenModal/>
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6 py-3 d-flex flex-column align-items-center justify-content-center gap-2">
          {postArray.length === 0 ? null : <CreateFormPost/>}
          {postArray.length === 0 ? (
            <PostCardSpinnerGroup/>
          ) : (
            postArray.slice(0, shownPost).map((post) => (
              <PostCardComponent key={post.id} post={post} />
            ))
          )}
          <ThreeDotSpinner/>
        </div>
      </div>
    </div>
  )
}

export default HomePage;
