'use client'

import { useEffect } from "react"
import NotificationLi from "../atoms/NotificationLi"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { setAllNotificationsSeen } from "../lib/slices/notificationSlice"

const NotificationDropDown = () => {
    const show = useAppSelector(state => state.status.showNotificationDropDown)
    const notifications = useAppSelector(state => state.notifications.notifications)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if(show){
            dispatch(setAllNotificationsSeen())
        }
    }, [show])
    
    return (
        <div className={`${show ? `d-block` : `d-none`} bg-white text-black position-absolute pe-3 py-2 rounded-2 shadow`} style={{minWidth:'30vw',zIndex: 1000, right: '1vh', boxShadow: '4px -2px 8px rgba(0, 0, 0, 0.1) !important'}}>
            <ol className="p-0 m-0 px-3" style={{fontSize:'0.8rem'}}>
            {notifications.toReversed().map(notification => (
                    <NotificationLi key={notification.id} notification={notification} />
            ))}
            </ol>
        </div>
    )
}

export default NotificationDropDown
