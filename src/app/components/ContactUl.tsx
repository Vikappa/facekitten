'use client'

import HomePageSideLiUser from "../atoms/HomePageSideLiUser"
import { useAppSelector } from "../lib/hooks"

const ContactUl = () => {

    const accountsArray = useAppSelector(state => state.sessionGeneratedAccounts.acc)

    return(
        <ul>
            <li className="fs-5 list-unstyled py-1">Contatti</li>
            {accountsArray && accountsArray.map(user => (
                <HomePageSideLiUser key={user.name} user={{profilepicture:user.profilePic, userName:user.name}}/>
            ))}
        </ul>
    )
}

export default ContactUl