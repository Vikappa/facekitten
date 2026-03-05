import Navbar from "./NavbarParts/Navbar";

export enum PageFocus {
    Home,
    Profile,
    Messages,
    Notifications,
    Settings,
    Search
}

export default function CommonLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <>
        <Navbar/>
                {children}
        </>
    );
}