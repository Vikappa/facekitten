'use client'

import { useAppSelector } from "../lib/hooks"

const StoreMonitor = () => {
    const store = useAppSelector(state => state)
    return(
    <div className="p-2 m-2 bg-white ">
        <p>
        store.status.shownpage: 
        {store.status.shownpage}
        </p>

        <p>
        store.userCredentials.userName: 
        {store.userCredentials.userName}
        </p>
        
    </div>
)
}

export default StoreMonitor