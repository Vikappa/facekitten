import { MakeFakeAccount } from "../FakeAccountFactory/FakeAccountFactory"
import { CasualUser } from "../StorageDataTypes"

export const CreateInitialCluster = async (): Promise<CasualUser[]> => {
    const fakeAccounts: CasualUser[] = []
    for (let index = 0; index < 12; index++) {
        fakeAccounts.push(await MakeFakeAccount())
    }
    return fakeAccounts
}