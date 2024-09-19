'use client'
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import PostCardComponent from "../components/PostCardComponent";
import PostCardSpinnerGroup from "../spinners/PostCardSpinnerGroup";
import CreateFormPost from "../components/CreatePostForm";
import MobileOptionFullScreenModal from "../modali/MobileOptionFullScreenModal";
import ThreeDotSpinner from "../spinners/ThreeDotSpinner";
import Image from "next/image";
import HomePageSideLi from "../atoms/HomePageSideLi";
import { FaUserFriends } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import { IoBookmarkSharp } from "react-icons/io5";
import { MdGroups } from "react-icons/md";
import { PiVideoFill } from "react-icons/pi";
import { FaShop } from "react-icons/fa6";
import { SiFeedly } from "react-icons/si";
import { setShowDropDownNotification, setShowMobileSearch, setShowNotificationModal, setShowProfileDropDown } from "../lib/slices/appStateSlice";
import ContactUl from "../components/ContactUl";
import BirthdaysComponent from "../components/BirthdaysComponent";
import { spreadOldPosts } from "../lib/slices/sessionGeneratedAccountsSlice";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const accountsFromRedux = useAppSelector((state) => state.sessionGeneratedAccounts.acc);
  const userpost = useAppSelector((state) => state.posts.userPosts);
  const userName = useAppSelector((state) => state.userCredentials.userName);
  const profilepictureUrl = useAppSelector((state) => state.userCredentials.profilepictureUrl);
  const [isFetching, setIsFetching] = useState(false);

  const postArray = useMemo(() => {
    const returnArray = accountsFromRedux.flatMap((accounts) => accounts.posts);
    returnArray.push(...userpost);
    returnArray.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return returnArray;
  }, [accountsFromRedux, userpost]);

  const loadMorePosts = async () => {
    setIsFetching(true);
    setTimeout(async () => {
      // const oldPosts = await PostCluster6(accountsFromRedux)
      // console.log(oldPosts)
      // dispatch(spreadOldPosts(oldPosts));
      setIsFetching(false);
    }, 2000)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const totalHeight = document.documentElement.scrollHeight

      if (scrollPosition >= totalHeight - 1 && !isFetching) {
        loadMorePosts()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isFetching])

  const handleButton1 = () => {
    dispatch(setShowNotificationModal(false));
    dispatch(setShowDropDownNotification(false));
    dispatch(setShowProfileDropDown(false));
    dispatch(setShowMobileSearch(false));
  };

  return (
    <div className="container-fluid">
      <MobileOptionFullScreenModal />
      <div className="row position-relative">

        <div className="col-0 col-md-3 d-none d-lg-block p-0 m-0 p-4 position-fixed start-0">
          <ul className="p-0 m-0">
            <li className="d-flex align-items-center gap-2 fw-bold py-2 liSideElement" onClick={handleButton1}>
              <Image src={profilepictureUrl} alt={userName} height={40} width={40} className="rounded-circle" />
              {userName}
            </li>
            <HomePageSideLi icon={<FaUserFriends style={{ color: "#23ADFD" }} size={35} />} text={"Friends"} />
            <HomePageSideLi icon={<FaClockRotateLeft size={35} style={{ color: "#1877F2" }} />} text={"Memories"} />
            <HomePageSideLi icon={<IoBookmarkSharp size={35} style={{ color: "#AE4FD8" }} />} text={"Saved"} />
            <HomePageSideLi icon={<MdGroups size={35} style={{ color: "#209CFA" }} />} text={"Groups"} />
            <HomePageSideLi icon={<PiVideoFill size={35} style={{ color: "#30AAD4" }} />} text={"Video"} />
            <HomePageSideLi icon={<FaShop size={35} style={{ color: "#55C7D5" }} />} text={"Marketplace"} />
            <HomePageSideLi icon={<SiFeedly size={35} style={{ color: "#209DF9" }} />} text={"Feed"} />
          </ul>
        </div>

        <div className="col-12 col-md-9 col-lg-6 py-3 d-flex flex-column align-items-center justify-content-center gap-2 mx-auto">
          {postArray && postArray.length === 0 ? "" : <CreateFormPost />}
          {postArray && postArray.length === 0 ? (
            <PostCardSpinnerGroup />
          ) : (
            <>
              {postArray.map((post) => (
                <PostCardComponent key={`${post.id}${post.author.userName}`} post={post} />
              ))}
              {isFetching && <ThreeDotSpinner />}
            </>
          )}
        </div>

        <div className="col-0 col-lg-3 d-none d-lg-block position-fixed end-0 p-4">
          <BirthdaysComponent />
          <ContactUl />
        </div>

      </div>
    </div>
  );
};

export default HomePage;
