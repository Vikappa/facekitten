import { generateRandomInterval, MakeFakeAccount, MakeFakeAccountNoPosts } from "../FakeAccountFactory/FakeAccountFactory"
import { FakePostTextFactory, generateXMutedImagePosts, generateXVideoPosts } from "../FakePostFactory/FakePostFactory"
import { CasualUser, NormalPostBody } from "../StorageDataTypes"

const jwtSecret = process.env.NEXT_PUBLIC_SELF

export const getCasualNewsArray = async (): Promise<string[]> => {
    const response = await fetch('api/getnews',{
        headers: {
            'Authorization': `Bearer ${jwtSecret}`,
            'Content-Type': 'application/json'
        }, 
    })
    if (!response.ok) {
        throw new Error('Failed to fetch news')
    }
    return await response.json()
}

export const CreateInitialCluster = async (): Promise<CasualUser[]> => {
    const fakeAccounts: CasualUser[] = []
    let postTexts: NormalPostBody[] = []
    const response = await fetch('/api/aigeneratedtext/initialpostcluster',
        {
            cache: 'no-store',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtSecret}`
            },
            body: JSON.stringify({ news: getCasualNewsArray() })
        }
    )
    if (response.ok) {
        const data = await response.json()
        const postStrings = [...data]
        for (let index = 0; index < postStrings.length; index++) {
            const newPostBody:NormalPostBody = {
                normalPostTex: postStrings[index]
            }
            postTexts.push(newPostBody)
        }
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
                profilepicture: fakeAccounts[random].profilePic,
                coverPhotoUrl: fakeAccounts[random].coverPhotoUrl
            },
            body: postTexts[index],
            comments: [],
            created_at: time.toISOString(),
            likes: Math.floor(Math.random() * 5),
            userliked: false,
            likeProfiles: []
        })
    }

    const reels = await generateXVideoPosts(3, fakeAccounts);
    
    for (let index = 0; index < reels.length; index++) {
        fakeAccounts.find(account => account.name === reels[index].author.userName)?.posts.push(reels[index])
    }

    const muteImages = await generateXMutedImagePosts(3, fakeAccounts)
    for (let index = 0; index < muteImages.length; index++) {
        fakeAccounts.find(account => account.name === muteImages[index].author.userName)?.posts.push(muteImages[index])
    }
    
    return fakeAccounts
}