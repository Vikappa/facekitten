'use client'
import { Button } from "react-bootstrap";
import { useAppSelector } from "../lib/hooks";
import { useEffect, useRef, useState } from "react";
import NotificationDropDown from "../components/NotificationDropDown";

const NotificationButton = (
    { iconSelected, iconUnselected, onClick, bgSelected, bgNotSelected, size }: 
    {bgSelected:string, bgNotSelected:string, iconSelected: JSX.Element;iconUnselected: JSX.Element; onClick: () => void; size: number }) => {

    const notificationLength = useAppSelector(state => state.notifications.notifications.flatMap(notification => notification.seen));
        const [prevLength, setPrevLength] = useState(notificationLength.length);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (notificationLength.length > prevLength) {
            audioRef.current?.play();
        }
        setPrevLength(notificationLength.length);
    }, [notificationLength.length, prevLength]);

    return (
        <div className="p-relative">
            <Button 
            onClick={onClick}
            className={`
            ${notificationLength.length > 0 ? bgSelected : bgNotSelected} 
            border-0
            d-flex justify-content-center align-items-center
            rounded-circle
            p-2 m-0
            ${notificationLength.length > 0 ? `text-primary` : `text-black`} 
            fs-2
            `}
            >
                {notificationLength.length > 0 ? iconSelected : iconUnselected}
            </Button>
            <NotificationDropDown/>
            <audio ref={audioRef} src="/assets/notificationEffect.m4a" />
        </div>
    );
}

export default NotificationButton;
