import { FakePostFactory } from "../FakePostFactory/FakePostFactory";
import { CreateFakeUser } from "../FakeUserFactory/FakeUserFactory";
import { CasualUser, Post } from "../StorageDataTypes";

export const generateRandomInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const MakeFakeAccount = async (): Promise<CasualUser> => {
    const fakeCredential = await CreateFakeUser();
    const fakeAccountsPosts: Post[] = [];
    const postsNumber = Math.round(Math.random() * 20);

    const minIntervalInHours = 1;  // Intervallo minimo tra i post (1 secondo)
    const maxIntervalInDays = 2;   // Intervallo massimo tra i post (2 giorni)

    let lastPostTime = new Date().getTime();  

    for (let index = 0; index < postsNumber; index++) {
        const randomInterval = generateRandomInterval(minIntervalInHours * 1000, maxIntervalInDays * 86400000);
        if (index === 0) {
            fakeAccountsPosts.push(await FakePostFactory(new Date(randomInterval), fakeCredential));        
        } else {
            lastPostTime -= randomInterval;
            fakeAccountsPosts.push(await FakePostFactory(new Date(lastPostTime), fakeCredential));
        }
    }

    return {
        name: fakeCredential.userName,
        profilePic: fakeCredential.profilepicture, 
        posts: fakeAccountsPosts
    };
};
