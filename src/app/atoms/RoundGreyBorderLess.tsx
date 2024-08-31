import { Button } from "react-bootstrap"

const RoundGreyBorderLess = ({ iconSelected, iconUnselected, selected, onClick, bgSelected, bgNotSelected }: {bgSelected:string, bgNotSelected:string, iconSelected: any;iconUnselected: any;selected: boolean; onClick: () => void }) => {
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