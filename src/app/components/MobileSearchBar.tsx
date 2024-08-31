import { useState } from "react"
import { Form } from "react-bootstrap"
import { CiSearch } from "react-icons/ci";
import RoundGreyBorderLess from "../atoms/RoundActivableButton";
import Image from "next/image";

const MobileSearchBar = () => {

    const [showSearch, setShowSearch] = useState(false)

    return(
        <div className="d-block d-sm-none">
            <Form className="d-flex align-items-center gap-3">
                {
                    showSearch ?
                    <>
                    <CiSearch className="position-absolute" style={{transform:'translate(30%,5%)'}} size={22}/>
                    <Form.Control type="text" placeholder={`     cerca su meowbook`} className="bg-grayBg rounded-pill border-0 p-2" >
                    </Form.Control>
                    </>
                    :
                    <>
                    <Image src={'/img/facekittenlogo.png'} alt="Logo" width={42} height={42}/>
                    <RoundGreyBorderLess bgSelected={'bg-grayBg'} bgNotSelected={'bg-grayBg'} iconSelected={<CiSearch/>} iconUnselected={<CiSearch/>} selected={false} onClick={() => setShowSearch(true)} />
                    </>
                }

            </Form>
        </div>
    )
}

export default MobileSearchBar