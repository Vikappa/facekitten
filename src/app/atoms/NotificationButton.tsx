'use client'
import { Button } from "react-bootstrap";
import { useAppSelector } from "../lib/hooks";
import { useEffect, useRef, useState } from "react";
import NotificationDropDown from "../components/NotificationDropDown";
import NotificationRedDot from "./NotificationRedDot";

const NotificationButton = (
    { iconSelected, iconUnselected, onClick, bgSelected, bgNotSelected, size }: 
    {bgSelected:string, bgNotSelected:string, iconSelected: JSX.Element;iconUnselected: JSX.Element; onClick: () => void; size: number }) => {
        const showNotificationDropDown = useAppSelector( state => state.status.showNotificationDropDown)




    return (
        <div className="position-relative">
            <Button 
            onClick={onClick}
            className={`
            ${showNotificationDropDown ? bgSelected : bgNotSelected} 
            border-0
            d-flex justify-content-center align-items-center
            rounded-circle
            p-2 m-0
            ${showNotificationDropDown ? `text-primary` : `text-black`} 
            fs-2
            `}
            >
                {showNotificationDropDown ? iconSelected : iconUnselected}
            </Button>
            <NotificationRedDot/>
        </div>
    );
}

export default NotificationButton;
