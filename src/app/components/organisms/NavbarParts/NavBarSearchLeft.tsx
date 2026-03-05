'use client'
import { useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

interface NavBarSearchLeftProps {
    isSmallSearchBarVisible: boolean;
    setIsSmallSearchBarVisible: (visible: boolean) => void;
}

export default function NavBarSearchLeft({ isSmallSearchBarVisible, setIsSmallSearchBarVisible }: NavBarSearchLeftProps) {

    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="relative ps-2">
            <div
                className="
                    md:hidden
                    w-full ps-3 md:ps-10 rounded-full
                    absolute top-0 left-2
                    focus-visible:border-light-blue-500
                "
            >
                {
                    isSmallSearchBarVisible ? (
                        <input
                            className="
                            rounded-full
                           py-[5px] mt-0.5
                           ps-7.5
                        text-gray-400
                        caret-gray-500            /* colore del cursore | */
                        placeholder:text-gray-400       /* colore placeholder */
                    bg-tertiary border border-tertiary
                    focus-visible:outline-none
                    focus-visible:ring-0
                "
                            type="text"
                            name=""
                            id=""
                            placeholder="Cerca micetti..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    )
                        :
                        (
                            <div className="p-3 hidden rounded-full px-1
                                        bg-tertiary border border-tertiary
                            
                            ">

                            </div>
                        )
                }
            </div>
            <input
                type="text"
                placeholder="Cerca micetti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                    hidden md:block
                    w-full ps-10 p-2 rounded-full
                    bg-tertiary border border-tertiary

                    text-gray-400
                    caret-gray-500            /* colore del cursore | */
                    placeholder:text-gray-400       /* colore placeholder */

                    focus-visible:outline-none
                    focus-visible:ring-0
                    focus-visible:ring-offset-tertiary
                    focus-visible:border-light-blue-500
                    
                "
            />
            <HiOutlineMagnifyingGlass className="hidden md:block absolute left-5 top-3 text-gray-400 text-xl drop-shadow-[0_0_0.5px_currentColor]" />
            <div className="md:hidden absolute py-2 rounded-full px-2.5 m-px bg-tertiary border border-tertiary">
                <HiOutlineMagnifyingGlass
                    className=" left-5 top-3 text-gray-400 text-xl drop-shadow-[0_0_0.5px_currentColor] "
                    onClick={() => {
                        const nextVisible = !isSmallSearchBarVisible;
                        setIsSmallSearchBarVisible(nextVisible);
                    }}
                />
            </div>
        </div>
    )
}
