import { useAppDispatch, useAppSelector } from "@/app/lib/hooks"
import { MakeFakeAccount } from "../FakeAccountFactory/FakeAccountFactory"
import { CasualUser, Post } from "../StorageDataTypes"
import { FakePostFactory, FakeTextPostFactory, fetchRandomPostFoto } from "../FakePostFactory/FakePostFactory"
import { addPostToAccount, randomCommentsOnExistingPost } from "@/app/lib/slices/sessionGeneratedAccountsSlice"

export const CreateInitialCluster = async (): Promise<CasualUser[]> => {
    const fakeAccounts: CasualUser[] = []
    const fakeAccountsNumber = Math.round(Math.random() * 50)
    for (let index = 0; index < fakeAccountsNumber; index++) {
        fakeAccounts.push(await MakeFakeAccount())
    }
    return fakeAccounts
}
