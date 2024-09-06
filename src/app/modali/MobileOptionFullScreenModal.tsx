'use client'
import { Modal } from "react-bootstrap"
import { useAppDispatch, useAppSelector } from "../lib/hooks"
import { hideOptionsModal, setNavbarPage, setShowMobileSearch } from "../lib/slices/appStateSlice"
import { FaArrowLeft } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import MobileOptProfileRectangle from "./modalComponents/MobileOptProfileRectangle";
import TastieraFunzioni from "./modalComponents/TastieraFunzioni";
import MobileOptionAccordion from "./modalComponents/MobileOptionAccordion";

const MobileOptionFullScreenModal = () => {
    const dispatch = useAppDispatch()
    const pageShown = useAppSelector(state => state.status.shownpage)
    const show = useAppSelector(state => state.status.showMobileOptModal)
    
    return(
        <Modal 
        className="bg-grayBg" 
        show={(pageShown===8) && show} 
        fullscreen={true} 
        onHide={() => {
          dispatch(setNavbarPage(0))
          dispatch(hideOptionsModal())
        }
        }>
        <Modal.Header className="p-2 px-3 bg-grayBg d-flex justify-content-between">
          <div className="d-flex justify-content-between align-items-center w-100 bg-grayBg">
            <div className="d-flex align-items-center justify-content-center gap-3">
            <FaArrowLeft onClick={() => {
          dispatch(setNavbarPage(0))
          dispatch(hideOptionsModal())
        }}/>
            <Modal.Title className="bg-grayBg" style={{fontSize:'1rem', fontWeight:'bold'}}>Menu</Modal.Title>
            </div>
          <FaSearch onClick={() => {
          dispatch(setNavbarPage(0))
          dispatch(hideOptionsModal())
          dispatch(setShowMobileSearch(true))
        }} />
          </div>
        </Modal.Header>
        <Modal.Body 
        className="bg-grayBg
        d-flex flex-column align-items-center justify-content-center p-0
        ">
          <MobileOptProfileRectangle/>
          <TastieraFunzioni/>
          <MobileOptionAccordion/>
          </Modal.Body>
      </Modal>
    )
}

export default MobileOptionFullScreenModal
