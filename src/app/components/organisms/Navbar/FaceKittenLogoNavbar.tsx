import Image from "next/image";

export function FaceKittenLogoNavbar() {

    return (
        <Image
            src="/img/facekittenlogo.png"
            alt="FaceKitten Logo"
            width={40}
            height={40}
            priority
            quality={100}
            sizes="40px"
            className="rounded-full cursor-pointer"
        />
    );
}