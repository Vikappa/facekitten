'use client'
import { useState } from "react"
import GamesSquaredButton from "../atoms/GamesSquaredButton"
import GroupSquaredButton from "../atoms/GroupsSquaredButton"
import HomeSquaredButton from "../atoms/HomeSquaredButton"
import MarketSquaredButton from "../atoms/MarketSquaredButton"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { setShowDropDownNotification, setShowProfileDropDown } from "../lib/slices/appStateSlice"

const MidNavBar = ({navbarPage, setNavbarPage}: {navbarPage:number; setNavbarPage(navbBarPage:number):void}) => {

    const router = useRouter()
    const dispatch = useAppDispatch()

    const setPage1 = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        router.push('/')
        setNavbarPage(1)
    }

    const setPage2 = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        router.push('/marketplace')
        setNavbarPage(2)
    }
    const setPage3 = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        router.push('/amici')
       setNavbarPage(3)
    }
    const setPage4 = () => {
        dispatch(setShowDropDownNotification(false))
        dispatch(setShowProfileDropDown(false))
        router.push('/games')
       setNavbarPage(4)
    }

    return (
    <div className="d-none d-md-flex align-items-center justify-content-center">
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={setPage1}>
        <HomeSquaredButton selected={(1===navbarPage)}/>
        {(1===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={setPage2} >
        <MarketSquaredButton selected={(2===navbarPage)}/>
        {(2===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={setPage3}>
        <GroupSquaredButton selected={(3===navbarPage)}/>
        {(3===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={setPage4}>
        <GamesSquaredButton selected={(4===navbarPage)}/>
        {(4===navbarPage) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
    </div>
    )
}

export default MidNavBar