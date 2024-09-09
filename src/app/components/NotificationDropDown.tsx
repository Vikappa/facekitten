'use client'

import { useAppSelector } from "../lib/hooks"

const NotificationDropDown = () => {
    const show = useAppSelector(state => state.status.showNotificationDropDown)
    const notifications = useAppSelector(state => state.notifications.notifications)
    return (
        <div className={`${show ? `d-block` : `d-none`} position-absolute top-100 end-0 w-100`}>
            {notifications.map(notification => (
                <li key={notification.id}>
                    {notification.id}
                </li>
            ))}
        </div>
    )
}

export default NotificationDropDown