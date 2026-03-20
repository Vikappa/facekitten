'use client'
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { resetNavbarUiState, setActiveNavFunction, setSearchTerm, setSmallSearchBarVisible, toggleSmallSearchBarVisible } from "@/lib/redux/uiSlice";
import { useEffect } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

export default function NavBarSearchLeft() {
    const dispatch = useAppDispatch();
    const searchTerm = useAppSelector((state) => state.ui.searchTerm);
    const isSmallSearchBarVisible = useAppSelector((state) => state.ui.isSmallSearchBarVisible);

    function openSmallSearchBar() {
        dispatch(toggleSmallSearchBarVisible())
        dispatch(setActiveNavFunction(null))
    }

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
                            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
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
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
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
                        openSmallSearchBar()
                    }}
                />
            </div>
        </div>
    )
}
