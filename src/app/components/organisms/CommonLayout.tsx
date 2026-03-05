import Image from "next/image";
import NavBarSearhBarBig from "./NavbarParts/NavBarSearhBarBig";
import Midnavbar from "./NavbarParts/MidNavbar";
import NavbarFunctions from "./NavbarParts/NavBarFunctions";

export default function CommonLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="w-full bg-white shadow-sm py-2 px-3 flex gap-2 justify-between" >
                <div className="flex">
                    <Image src="/img/facekittenlogo.png" alt="FaceKitten Logo" width={40} height={40} />
                    <NavBarSearhBarBig />
                </div>
                <Midnavbar/>
                <NavbarFunctions/>
            </div>

            {children}
        </>
    );
}