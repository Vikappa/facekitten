import { CreateFakeUser } from "../FakeUserFactory/FakeUserFactory"
import { Post, PostComment, UserDetails } from "../StorageDataTypes"

export const FakePostFactory = async (time: Date, author:UserDetails): Promise<Post> => {
    let fakePostText = ""
    const fakePostSortWords = ['meo', 'meow', 'miao', 'mau', 'hiss', 'hisssss', 'prrrr', 'prrrrra', 'prrraaau', 'prau', 'nyan', 'nya', 
        'meeeooow', 'frrr', 'frrrrrr', 'frau', '(procede a stiracchiarsi)', '* crunch crunch *'
    ]
    const numberOfWords = Math.floor(Math.random() * 60)
    for (let index = 0; index < numberOfWords; index++) {
        fakePostText += fakePostSortWords[Math.floor(Math.random() * fakePostSortWords.length)] + ' '
    }   
    const fakePostComments:PostComment[] = []

    return {
        id:0,
        author,
        body: fakePostText,
        image: '',
        comments: fakePostComments,
        created_at: time.toISOString(),
        likes: 0
    }
}