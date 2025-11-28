'use client'
import { FaceKittenLogoNavbar } from "./FaceKittenLogoNavbar";
import { NavBarActionButton } from "./NavbarActionButton";
import { PiSquaresFourFill } from "react-icons/pi";
import { FaFacebookMessenger, FaBell } from "react-icons/fa";
import { NavBarSearchPill } from "./NavBarSearchPill";
import { useState } from "react";
import { MdOutlineArrowBack } from "react-icons/md";
import { NavBarUserButton } from "./NavBarUserButton";

export function NavBar() {
    const [isSearching, setIsSearching] = useState(false);

    return (
        <div className="shadow-lg w-full z-10">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {!isSearching && <FaceKittenLogoNavbar />}

                    <div className={`
                                        flex items-center overflow-hidden
                                        ${isSearching ? "flex-1 min-w-0" : "flex-none"}
                                    `}>
                        {isSearching && (
                            <NavBarActionButton
                                icon={MdOutlineArrowBack}
                                className="p-1 text-gray-500"
                                ringClassName="p-1 bg-transparent"
                                functionProp={() => setIsSearching(false)}
                            />
                        )}

                        <NavBarSearchPill
                            size={40}
                            isOpen={isSearching}
                            setIsOpen={setIsSearching}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-none pe-1">
                    <NavBarActionButton
                        icon={PiSquaresFourFill}
                        ringClassName="p-1 bg-gray-200 rounded-full"
                    />
                    <NavBarActionButton
                        icon={FaFacebookMessenger}
                        className="p-1"
                        ringClassName="p-1 bg-gray-200 rounded-full"
                    />
                    <NavBarActionButton
                        icon={FaBell}
                        className="p-1"
                        ringClassName="p-1 bg-gray-200 rounded-full"
                    />
                    <NavBarUserButton size={40}/>
                </div>
            </div>
        </div>
    );
}
