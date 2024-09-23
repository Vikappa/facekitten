import { useAppDispatch, useAppSelector } from "../lib/hooks"
import RoundGreyBorderLess from "./RoundActivableButton"
import { FaGear } from "react-icons/fa6";

const MarketplaceSidebarheader = () => {
  const dispatch = useAppDispatch()
  const userName = useAppSelector(state => state.userCredentials.userName)
  const profilepictureUrl = useAppSelector(state => state.userCredentials.profilepictureUrl)
  const accountsPost = useAppSelector(state => state.sessionGeneratedAccounts.acc.flatMap(account => account.posts))
  const userPosts = useAppSelector(state => state.posts.userPosts)
  const allAccounts = useAppSelector(state => state.sessionGeneratedAccounts.acc)
  const marketPlacePostsCount = useAppSelector(state =>
    state.sessionGeneratedAccounts.acc.reduce((acc, account) =>
      acc + account.posts.filter(post => post.body && typeof post.body === "object" && 'marketplacePhotoUrl' in post.body).length, 0
    )
  )

  const fakeFunction = () =>{

  }
  return(
    

    <div className="d-flex justify-content-between align-items-center py-3">
        <p className="p-0 m-0 fs-4 fw-bolder mb-1">Marketplace</p>
        <RoundGreyBorderLess 
        bgSelected={"bg-grayBg"} 
        bgNotSelected={"bg-grayBg"} 
        iconSelected={<FaGear />} 
        iconUnselected={<FaGear />} 
        selected={false} 
        onClick={fakeFunction} 
        size={0} />
    </div>
  )
}

export default MarketplaceSidebarheader