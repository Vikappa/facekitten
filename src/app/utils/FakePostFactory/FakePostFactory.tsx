import { CreateFakeUser } from "../FakeUserFactory/FakeUserFactory"
import { Post, PostComment, UserDetails } from "../StorageDataTypes"

export const FakePostFactory = async (time = new Date()): Promise<Post> => {
    const author: UserDetails = await CreateFakeUser()
    let fakePostText = ""
    const fakePostSortWords = ['meo', 'meow', 'miao', 'mau', 'hiss', 'hisssss', 'prrrr', 'prrrrra', 'prrraaau', 'prau', 'nyan', 'nya', 
        'meeeooow', 'frrr', 'frrrrrr', 'frau'
    ]
    const numberOfWords = Math.floor(Math.random() * 40)
    for (let index = 0; index < numberOfWords; index++) {
        fakePostText += fakePostSortWords[Math.floor(Math.random() * fakePostSortWords.length)] + ' '
    }   
    const fakePostComments:PostComment[] = []

    return {
        author,
        body: fakePostText,
        image: '',
        comments: fakePostComments,
        created_at: time
    }
}