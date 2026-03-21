'use client'

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { usePathname, useRouter } from "next/navigation";

export default function MessengerModal(){
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const isOpen = useAppSelector((state) => state.ui.activeNavFunction === "messenger");

    if(isOpen){
        return (
            <>MESSAGGI</>
        )
    }
}