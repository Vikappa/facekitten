import { Post, PostComment, UserDetails } from "../StorageDataTypes"

export const FakePostFactory = async (time: Date, author:UserDetails, num:number): Promise<Post> => {
    let fakePostText = ""
    const fakePostSortWords = ['meo', 'meow', 'miao', 'mau', 'hiss', 'hisssss', 'prrrr', 'prrrrra', 'prrraaau', 'prau', 'nyan', 'nya', 
        'meeeooow', 'frrr', 'frrrrrr', 'frau', '(procede a stiracchiarsi)', '* crunch crunch *', '*sniff sniff*', '(si lecca)'
    ]
    const numberOfWords = Math.round(Math.random() * 60)
    for (let index = 0; index < numberOfWords; index++) {
        fakePostText += fakePostSortWords[Math.floor(Math.random() * fakePostSortWords.length)+1] + ' '
    }   
    const fakePostComments:PostComment[] = []
    const random = Math.round(Math.random()*100)
    let imageString = ''
    if (random < 20) {
        imageString = await fetchRandomPostFoto()
    }
    return {
        id:num,
        author,
        body: fakePostText,
        image: imageString,
        comments: fakePostComments,
        created_at: time.toISOString(),
        likes: 0
    }
}

export const fakePostCommentFactory = (commentAuthor:UserDetails, commentedPost:Post, commented_at:string, commentText:string): PostComment => {

  const postId = commentedPost.comments.length + 1

  return {
    id: postId,
    author: commentAuthor,
    body: commentText,
    commented_at: commented_at
  }
}

export const fetchRandomPostFoto = async (): Promise<string> => {
    const queryUrl = `/api/storedcatphotos`; 
  
    try {
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error('Errore nella fetch della picture casuale');
      }
      const data = await response.json();
      return data
    } catch (error) {
      console.error(error);
      // Stringa di fallback in caso di errore
      return '';
    }
}
