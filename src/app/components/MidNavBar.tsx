'use client'
import { useRef, useState } from "react"
import GamesSquaredButton from "../atoms/GamesSquaredButton"
import GroupSquaredButton from "../atoms/GroupsSquaredButton"
import HomeSquaredButton from "../atoms/HomeSquaredButton"
import MarketSquaredButton from "../atoms/MarketSquaredButton"

const MidNavBar = () => {

    const [shownSection, setShowSection] = useState(1) 

    return (
    <div className="d-none d-sm-flex align-items-center justify-content-center">
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setShowSection(1)}>
        <HomeSquaredButton selected={(1===shownSection)}/>
        {(1===shownSection) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setShowSection(2)} >
        <MarketSquaredButton selected={(2===shownSection)}/>
        {(2===shownSection) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setShowSection(3)}>
        <GroupSquaredButton selected={(3===shownSection)}/>
        {(3===shownSection) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
        <button className={`bg-transparent border-0 p-0 m-0 bg-transparent midNavBarButton`} onClick={() => setShowSection(4)}>
        <GamesSquaredButton selected={(4===shownSection)}/>
        {(4===shownSection) && <hr className="text-primary p-0 m-0 thicker-hr"/>}
        </button>
    </div>
    )
}

export default MidNavBar