'use client'

import HomePageSideLiUser from "../atoms/HomePageSideLiUser"
import { useAppSelector } from "../lib/hooks"

const ContactUl = () => {

    const accountsArray = useAppSelector(state => state.sessionGeneratedAccounts.acc)

    return(
        <ul className="m-0 p-0 py-2">
            <li className="fs-5 list-unstyled py-1">Contatti</li>
            {accountsArray && accountsArray.map(user => (
                <HomePageSideLiUser key={user.name} user={{profilepicture:user.profilePic, userName:user.name, coverPhotoUrl:user.coverPhotoUrl}} />
            ))}
        </ul>
    )
}

export default ContactUl