import { FakePostFactory } from "../FakePostFactory/FakePostFactory";
import { CreateFakeUser } from "../FakeUserFactory/FakeUserFactory";
import { CasualUser, Post } from "../StorageDataTypes";

export const generateRandomInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const MakeFakeAccount = async (): Promise<CasualUser> => {
    const fakeCredential = await CreateFakeUser();
    const fakeAccountsPosts: Post[] = [];
    const postsNumber = Math.round(Math.random() * 5 + 5);

    const minIntervalInHours = 1000;  // Intervallo minimo tra i post (1 secondo)
    const maxIntervalInDays = 86400000 *2;   // Intervallo massimo tra i post (2 giorni)

    let lastPostTime = new Date().getTime();  

    for (let index = 0; index < postsNumber; index++) {
        const randomInterval = generateRandomInterval(minIntervalInHours , maxIntervalInDays );
        if (index !== 0) {
            lastPostTime -= randomInterval;
        }
        fakeAccountsPosts.push(await FakePostFactory(new Date(lastPostTime), fakeCredential, index));        
    }

    return {
        name: fakeCredential.userName,
        profilePic: fakeCredential.profilepicture, 
        posts: fakeAccountsPosts
    };
};
