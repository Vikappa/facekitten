'use client'

import { useAppSelector } from "../lib/hooks"

const NotificationRedDotMobileVersion = () => {
    const activeNotifications = useAppSelector(state => state.notifications.notifications.reduce((acc, notification) => acc + (notification.seen === false ? 1 : 0), 0))

    if(activeNotifications){
        if(activeNotifications > 0){
            return <div 
            className="position-absolute p-0 px-1 m-0 bg-danger rounded-circle text-white" 
            style={{fontSize:'0.6rem', bottom: '0', right:'0.25rem'}}
            >{activeNotifications}</div>
        }
    }

    return null
}

export default NotificationRedDotMobileVersion