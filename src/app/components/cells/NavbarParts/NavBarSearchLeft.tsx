'use client'
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setActiveNavFunction, setSearchTerm, setSmallSearchBarVisible, toggleSmallSearchBarVisible } from "@/lib/redux/uiSlice";
import { useEffect, useRef, useState } from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { SearchResultOl } from "./SearchResultOl";

export default function NavBarSearchLeft() {
    const dispatch = useAppDispatch();
    const searchTerm = useAppSelector((state) => state.ui.searchTerm);
    const isSmallSearchBarVisible = useAppSelector((state) => state.ui.isSmallSearchBarVisible);
    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const [isDesktopSearchVisible, setIsDesktopSearchVisible] = useState(false);

    useEffect(() => {
        if (!isSmallSearchBarVisible) {
            return;
        }

        const closeOnOutsideClick = (event: MouseEvent) => {
            const searchContainer = searchContainerRef.current;
            if (!(event.target instanceof Node) || !searchContainer) {
                return;
            }

            if (!searchContainer.contains(event.target)) {
                dispatch(setSmallSearchBarVisible(false));
            }
        };

        document.addEventListener("mousedown", closeOnOutsideClick);

        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
        };
    }, [dispatch, isSmallSearchBarVisible]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const syncDesktopSearchState = () => {
            setIsDesktopSearchVisible(mediaQuery.matches);
        };

        syncDesktopSearchState();
        mediaQuery.addEventListener("change", syncDesktopSearchState);

        return () => {
            mediaQuery.removeEventListener("change", syncDesktopSearchState);
        };
    }, []);

    function openSmallSearchBar() {
        dispatch(toggleSmallSearchBarVisible())
        dispatch(setActiveNavFunction(null))
    }

    function closeSearchResults() {
        dispatch(setSearchTerm(""));
        dispatch(setSmallSearchBarVisible(false));
    }

    return (
        <div ref={searchContainerRef} className="relative ps-2 md:w-80">
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
            <SearchResultOl
                query={searchTerm}
                isVisible={isSmallSearchBarVisible || isDesktopSearchVisible}
                onSelect={closeSearchResults}
            />
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
