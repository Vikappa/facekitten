import { Button } from "react-bootstrap"

const SquaredOptButton = ({ text, icon, onClick, color }: 
    {text:string;  icon: JSX.Element;  onClick: () => void; color:string }) => {
    return (
        <div
        className="col-6 col-md-4 p-1">
        <Button 
        onClick={onClick}
        className={`
        bg-white text-black fs-5 text-start
        border-0
        d-flex flex-column 
        justify-content-center align-items-start
        rounded-3 p-3 m-0 
        w-100 
        `}
        style={{
            border:'1px solid var(--bs-quinary)'
        }}
        >
            <span style={{color:color}}>{icon}</span>
            {text}
        </Button>
        </div>
    )
}
export default SquaredOptButton