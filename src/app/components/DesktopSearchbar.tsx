import Image from "next/image"
import { Form } from "react-bootstrap"
import { CiSearch } from "react-icons/ci";

const DesktopSearchbar = () => {
    return(
        <div className="d-flex align-items-center gap-3">
        <Image src={'/img/facekittenlogo.png'} alt="Logo" width={50} height={50}/>
        <CiSearch className="position-absolute" style={{transform:'translate(300%,0)'}} size={25}/>
        <Form className="d-none d-sm-block">
            <Form.Control type="text" placeholder={`      Cerca su meowbook`} className="bg-grayBg rounded-pill border-0 p-2" >
            </Form.Control>
        </Form>
        </div>
    )
}

export default DesktopSearchbar