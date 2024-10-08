import { Button } from "react-bootstrap"

const RoundGreyBorderLess = ({ iconSelected, iconUnselected, selected, onClick, bgSelected, bgNotSelected, size }: {bgSelected:string, bgNotSelected:string, iconSelected: JSX.Element;iconUnselected: JSX.Element;selected: boolean; onClick: () => void; size: number }) => {
    return (
        <Button 
        onClick={onClick}
        className={`
        ${selected?bgSelected:bgNotSelected} 
        border-0
        d-flex justify-content-center align-items-center
        rounded-circle
        p-2 m-0
        ${selected?`text-primary`:`text-black`} 
        
        fs-2
        `}
        >
            {selected ? iconSelected : iconUnselected}
        </Button>
    )
}

export default RoundGreyBorderLess