'use client'

import { useMemo, useState, useEffect } from "react"
import { useAppSelector } from "../lib/hooks"
import { CasualUser } from "../utils/StorageDataTypes"
import HomePageSideLiUser from "../atoms/HomePageSideLiUser"

const BirthdaysComponent = () => {
    const accounts = useAppSelector(state => state.sessionGeneratedAccounts.acc)
    const [electedAccount, setElectedAccount] = useState<CasualUser[]>([])

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            const selectedAccounts: CasualUser[] = []
            selectedAccounts.push(accounts[Math.floor(Math.random() * accounts.length)])
            let random = Math.floor(Math.random() * 100)
            while (random < 20) {
                const newRandomAccount = accounts[Math.floor(Math.random() * accounts.length)]
                let isNew = true
                for (let index = 0; index < selectedAccounts.length; index++) {
                    if (newRandomAccount === selectedAccounts[index]) isNew = false
                }
                if (isNew) {
                    selectedAccounts.push(newRandomAccount)
                }
                random = Math.floor(Math.random() * 100)
            }
            setElectedAccount(selectedAccounts)
        }
    }, [accounts])

    return (
        <div className="d-flex flex-column gap-0 py-2">
            <p className="fs-5 list-unstyled py-0 my-0">Compleanni:</p>
            {
                electedAccount.map((user, index) => (
                    <HomePageSideLiUser key={index} user={{profilepicture:user.profilePic, userName:user.name}}  />
                ))
            }
        </div>
    )
}
export default BirthdaysComponent
