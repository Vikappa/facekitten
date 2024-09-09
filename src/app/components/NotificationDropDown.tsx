'use client'

import NotificationLi from "../atoms/NotificationLi"
import { useAppSelector } from "../lib/hooks"

const NotificationDropDown = () => {
    const show = useAppSelector(state => state.status.showNotificationDropDown)
    const notifications = useAppSelector(state => state.notifications.notifications)
    return (
        <div className={`${show ? `d-block` : `d-none`} bg-white position-absolute text-end pe-3 py-2 rounded-2 `} style={{zIndex: 1000, right: '10vh', boxShadow: '4px -2px 8px rgba(0, 0, 0, 0.1) !important'}}>
            <ul>
            {notifications.toReversed().map(notification => (
                <li key={notification.id}>
                    <NotificationLi key={notification.id} notification={notification} />
                </li>
            ))}
            </ul>
        </div>
    )
}

export default NotificationDropDown
