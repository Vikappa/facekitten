'use client'

import { Button } from "react-bootstrap";

const ReelLi = ({titolo, icona}:
    {titolo: string; icona: JSX.Element}
) => {



    return(
        <li className="decoration-none d-flex align-items-center gap-2 px-2 pt-1" >
            <Button variant="grayBg" className="d-flex align-items-center justify-content-center rounded-circle p-2 fs-2 m-0 ">
            {icona}
            </Button>
            
            {titolo}
        </li>
    )
}

export default ReelLi