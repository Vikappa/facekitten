'use client'
import { useState } from "react"
import GamesSquaredButton from "../atoms/GamesSquaredButton"
import GroupSquaredButton from "../atoms/GroupsSquaredButton"
import HomeSquaredButton from "../atoms/HomeSquaredButton"
import MarketSquaredButton from "../atoms/MarketSquaredButton"

const MidNavBar = ({navbarPage, setNavbarPage}: {navbarPage:number; setNavbarPage(navbBarPage:number):void}) => {


    return (
    <div className="d-none d-md-flex align-items-center justify-content-center">
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setNavbarPage(1)}>
        <HomeSquaredButton selected={(1===navbarPage)}/>
        {(1===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setNavbarPage(2)} >
        <MarketSquaredButton selected={(2===navbarPage)}/>
        {(2===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setNavbarPage(3)}>
        <GroupSquaredButton selected={(3===navbarPage)}/>
        {(3===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setNavbarPage(4)}>
        <GamesSquaredButton selected={(4===navbarPage)}/>
        {(4===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
    </div>
    )
}

export default MidNavBar