import { generateRandomInterval, MakeFakeAccount, MakeFakeAccountNoPosts } from "../FakeAccountFactory/FakeAccountFactory"
import { FakePostTextFactory } from "../FakePostFactory/FakePostFactory"
import { CasualUser } from "../StorageDataTypes"

export const getCasualNewsArray = async (): Promise<string[]> => {
    const response = await fetch('api/getnews')
    if (!response.ok) {
        throw new Error('Failed to fetch news')
    }
    return await response.json()
}

export const CreateInitialCluster = async (): Promise<CasualUser[]> => {
    const fakeAccounts: CasualUser[] = []
    let postTexts: string[] = []
    const response = await fetch('/api/aigeneratedtext/initialpostcluster',
        {
            cache: 'no-store',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ news: getCasualNewsArray() })
        }
    )
    if (response.ok) {
        const data = await response.json()
        postTexts = [...data]
    } else {
        for (let index = 0; index < 30; index++) {
            postTexts.push(FakePostTextFactory())            
        }
    }

    for (let index = 0; index < 10; index++) {
        fakeAccounts.push(await MakeFakeAccountNoPosts())        
    }

    for (let index = 0; index < postTexts.length; index++) {
        let time = new Date()
        if (index !== 0) {
            const minIntervalInHours = 1000; 
            const maxIntervalInDays = 86400000 * 2; 
            const randomInterval = generateRandomInterval(minIntervalInHours, maxIntervalInDays);

            time.setTime(time.getTime() - randomInterval);
        }
        const random = Math.floor(Math.random() * fakeAccounts.length)
        fakeAccounts[random].posts.push({
            id: index,
            author: {
                userName: fakeAccounts[random].name,
                profilepicture: fakeAccounts[random].profilePic
            },
            body: postTexts[index],
            image: "",
            comments: [],
            created_at: time.toISOString(),
            likes: Math.floor(Math.random() * 5),
            userliked: false,
            likeProfiles: []
        })
    }

    return fakeAccounts
}