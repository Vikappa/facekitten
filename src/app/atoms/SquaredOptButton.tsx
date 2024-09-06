import { Button } from "react-bootstrap"

const SquaredOptButton = ({ text, icon, onClick }: 
    {text:string;  icon: JSX.Element;  onClick: () => void; }) => {
    return (
        <Button 
        onClick={onClick}
        className={`
        bg-white text-black fs-5 text-start
        border-0
        d-flex flex-column 
        justify-content-center align-items-start
        rounded-3 p-3 m-0 my-2
        w-100 wrap-nowrap
        `}
        style={{
            border:'1px solid var(--bs-quinary)'
        }}
        >
            {icon}
            {text}
        </Button>
    )
}
export default SquaredOptButton