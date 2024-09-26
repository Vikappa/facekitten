'use client'

import { useState } from "react"
import SquaredOptButton from "../atoms/SquaredOptButton"
import ProfilePageBarButton from "../atoms/ProfilePageBarButton"

const ProfilePageBar = ({profileBarState, setProfileBarState}:
    {profileBarState: number, setProfileBarState: (number:number) => void}
) => {


    const changePage = (number:number) => {
        if(number === profileBarState) return
        setProfileBarState(number)
    }

    return(
        <div className="d-flex flex-row align-items-center justify-content-start mb-2 gap-2 w-100">
            <ProfilePageBarButton text="Posts"  selected={profileBarState === 1}  setSelected={() => changePage(1)}  />
            <ProfilePageBarButton text="About"  selected={profileBarState === 2} setSelected={() => changePage(2)}  />
            <ProfilePageBarButton text="Friends"  selected={profileBarState === 3} setSelected={() => changePage(3)}  />
            <ProfilePageBarButton text="Photos"  selected={profileBarState === 4} setSelected={() => changePage(4)}  />
            <ProfilePageBarButton text="Videos"  selected={profileBarState === 5} setSelected={() => changePage(5)}  />
            <ProfilePageBarButton text="Check-in"  selected={profileBarState === 6} setSelected={() => changePage(6)}  />
            <ProfilePageBarButton text="More"  selected={profileBarState === 7} setSelected={() => changePage(7)}  />


        </div>
    )
}

export default ProfilePageBar