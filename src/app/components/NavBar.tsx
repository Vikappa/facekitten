'use client'
import DesktopSearchbar from "./DesktopSearchbar";
import MobileSearchBar from "./MobileSearchBar";
import MidNavBar from "./MidNavBar";
import DesktopProfileSection from "./DesktopProfileSection";
import MobileProfileSection from "./MobileProfileSection";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { setNavbarPage } from '../lib/slices/appStateSlice';
import MobileOptNavbar from "./MobileOptNavbar";

const NavBar = () => {
  const dispatch = useAppDispatch();
  const navbarPage = useAppSelector(state => state.status.shownpage);

  const setNavbarPageOnClick = (page: number) => {
    dispatch(setNavbarPage(page));
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-white shadow-sm w-100 position-sticky top-0" style={{ zIndex: '101' }}>
      <div className="d-flex justify-content-between align-items-center bg-white shadow-sm p-1 px-3 w-100">
        <DesktopSearchbar />
        <MobileSearchBar setSelected={setNavbarPage} />
        <MidNavBar navbarPage={navbarPage} setNavbarPage={setNavbarPageOnClick} />
        <DesktopProfileSection selected={navbarPage} setSelected={setNavbarPageOnClick} />
        <MobileProfileSection selected={navbarPage} setSelected={setNavbarPageOnClick} />
      </div>
      <div className="d-sm-none">
        <MobileOptNavbar />
      </div>
    </div>
  )
}

NavBar.displayName = 'NavBar';
export default NavBar;
