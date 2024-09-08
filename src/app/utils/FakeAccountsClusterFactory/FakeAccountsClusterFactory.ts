import { MakeFakeAccount } from "../FakeAccountFactory/FakeAccountFactory"
import { CasualUser } from "../StorageDataTypes"

export const CreateInitialCluster = async (): Promise<CasualUser[]> => {
    const fakeAccounts: CasualUser[] = []
    const fakeAccountsNumber = Math.round(Math.random() * 50)
    for (let index = 0; index < fakeAccountsNumber; index++) {
        fakeAccounts.push(await MakeFakeAccount())
    }
    return fakeAccounts
}