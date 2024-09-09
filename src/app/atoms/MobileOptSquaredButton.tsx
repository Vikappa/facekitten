'use client'

import { Button } from "react-bootstrap";

const MobileOptSquaredButton = ({ iconSelected, iconUnselected, selected, onClick }: {iconSelected: JSX.Element;iconUnselected: JSX.Element;selected: boolean; onClick: () => void; size: number }) => {

    return (
        <Button
        onClick={onClick}
        className={`
        bg-white 
        border-0
        d-flex justify-content-center align-items-center
        mt-1
        ${selected?`text-primary`:`text-black`} 
        
        fs-2
        `}
        >
            {selected ? iconSelected : iconUnselected}
        </Button>
    )
}

export default MobileOptSquaredButton