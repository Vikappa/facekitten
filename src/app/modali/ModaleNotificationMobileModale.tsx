'use client'
import { Modal } from "react-bootstrap"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { setShowNotificationModal } from "../lib/slices/appStateSlice"
import NavBar from "../components/NavBar"
import NotificationLi from "../atoms/NotificationLi"
import { setAllNotificationsSeen } from "../lib/slices/notificationSlice"
import { useEffect } from "react"

const ModaleNotificationMobileModale = () => {
    const dispatch = useAppDispatch()
    const notifications = useAppSelector(state => state.notifications.notifications)
    const show = useAppSelector(state => state.status.showNotificationModal)
    const handleHide = () => {
        dispatch(setShowNotificationModal(false))
    }

    useEffect(() => {
      if(!show){
        dispatch(setAllNotificationsSeen())
      }
    }, [show])
    
    
    return(
        <Modal show={show} fullscreen={true} onHide={() => handleHide()}>
        <Modal.Header className="m-0 p-0">
          <NavBar/>
        </Modal.Header>
        <Modal.Body>
          {
            notifications.length > 0 && notifications.map((notification, index) => (
              <NotificationLi key={index} notification={notification} />
            ))
          }
        </Modal.Body>
      </Modal>
    )
}

export default ModaleNotificationMobileModale