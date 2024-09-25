import { generateRandomInterval } from "../FakeAccountFactory/FakeAccountFactory"
import { CasualUser, ImagePostBody, MarketPlacePostString, NormalPostBody, Post, PostComment, UserDetails, VideoPostBody } from "../StorageDataTypes"
const jwtSecret = process.env.NEXT_PUBLIC_SELF

//Sorteggio a caso di parole
export const FakePostCommentTextFactory = () => {
  let fakePostCommentText = ""
  const fakePostSortWords = ['*blinks*', 'meow', 'miao', 'mau', 'hiss', 'hisssss', 'prrrr', 'prrrrra', 'prrraaau', 'prau', 'nyan', 'nya', 
      'meeeooow', 'frrr', 'frrrrrr', 'frau', 'mieo', ' * fugge *', 
  ]
  const numberOfWords = Math.round(Math.random() * 5+1)
  for (let index = 0; index < numberOfWords; index++) {
      fakePostCommentText += fakePostSortWords[Math.floor(Math.random() * fakePostSortWords.length)] + ' '
  }   
  return fakePostCommentText
}

//Generate 6 post partendo dagli utenti forniti e con tempo precedente a tutti i post esistenti (per simulare post più vecchi)
// export const PostCluster6 = async (currentAccounts:CasualUser[]):Promise<Post[]> => {
//   let returnArray: Post[] = []
//   const currentPosts = currentAccounts.flatMap((accounts) => accounts.posts);

//   // Verifica che l'array non sia vuoto
//   if (currentPosts.length === 0) {
//     throw new Error("No posts available");
//   }

//   // Filtra i post che hanno la proprietà 'created_at'
//   const validPosts = currentPosts.filter(post => post.created_at)

//   // Verifica che ci siano post validi con 'created_at'
//   if (validPosts.length === 0) {
//     throw new Error("No valid posts with 'created_at' found");
//   }

//   const oldestPost = validPosts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
//   const oldestPostDate = new Date(oldestPost.created_at)

//   let newOldest: Date
//   let lastPostIndex: number = currentPosts.length

//   try {
//     const reponse = await fetch('api/aigeneratedtext/postcluster',{
//       headers: {
//         'Authorization': `Bearer ${jwtSecret}`,
//         'Content-Type': 'application/json'
//       }
//     })
//     if(reponse.ok){
//       const data = await reponse.json()
//       for (let index = 0; index < data.length; index++) {
//         const minIntervalInHours = 1000;  // Intervallo minimo tra i post (1 secondo)
//         const maxIntervalInDays = 86400000 *2;   // Intervallo massimo tra i post (2 giorni)
//         const randomInterval = generateRandomInterval(minIntervalInHours , maxIntervalInDays );
//         newOldest = new Date(oldestPostDate.getTime() - randomInterval)
//         const sorted = currentAccounts[Math.floor(Math.random() * currentAccounts.length)]
//         const casualauthor: UserDetails = {
//           userName: sorted.name,
//           profilepicture: sorted.profilePic
//         }

//         const newPost: Post = {
//           id: lastPostIndex,
//           author: casualauthor,
//           body: FakePostTextFactory(),
//           comments: [],
//           created_at: newOldest.toISOString(),
//           likes: Math.floor(Math.random() * 6),
//           userliked: false,
//           likeProfiles: []
//         }
//         lastPostIndex++
//         returnArray.push(newPost)
        
//       }
//     }
//   } catch (error) {
//     console.error('Errore fetch generate 6 post texts')
//     console.error(error)
//     for (let index = 0; index < 6; index++) {
//       const minIntervalInHours = 1000;  // Intervallo minimo tra i post (1 secondo)
//       const maxIntervalInDays = 86400000 *2;   // Intervallo massimo tra i post (2 giorni)
//       const randomInterval = generateRandomInterval(minIntervalInHours , maxIntervalInDays );
//       newOldest = new Date(oldestPostDate.getTime() - randomInterval)
//       const sorted = currentAccounts[Math.floor(Math.random() * currentAccounts.length)]
//       const casualauthor: UserDetails = {
//         userName: sorted.name,
//         profilepicture: sorted.profilePic
//       }
//       const imageChance = Math.random() *100
//       const image = imageChance < 20 ? fetchRandomPostFoto() : ''
      
//       const newPost: Post = {
//         id: lastPostIndex,
//         author: casualauthor,
//         body: FakePostTextFactory(),
//         comments: [],
//         created_at: newOldest.toISOString(),
//         likes: Math.floor(Math.random() * 6),
//         userliked: false,
//         likeProfiles: []
//       }
//       lastPostIndex++
//       returnArray.push(newPost)
//     }
//   }

//   return returnArray
// }

//Crea un commento per un post prendendo il post in questione e l'autore del commento 
export const GenerateCommentText = async (post: Post, authorname: string): Promise<string> => {
  if(post.body !== undefined && typeof post.body === 'object' && 'normalPostTex' in post.body){
    let testoDelPost = `Testo del post: ${post.author.userName} scrive:\n${post.body.normalPostTex}`
    testoDelPost += post.comments
    .map(comment => `Autore: ${comment.author.userName} Commento: ${comment.body}`)
    .join('\n')
    try {
      const response = await fetch('/api/aigeneratedtext/commentreply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtSecret}`
        },
        body: JSON.stringify({ testoDelPost, authorname }),
      });
  
      try {
        const data = await response.json();
        return data.message;
      } catch (error) {
        console.error('Error parsing json');
        return FakePostCommentTextFactory();
      }
    } catch (error) {
      console.error('Error:', error);
      return FakePostCommentTextFactory();
    }
  } else if (post.body !== undefined && typeof post.body === 'object' && 'marketPlaceText' in post.body) {

    let testoDelPost = `Testo del post: ${post.author.userName} scrive:\n${post.body.marketPlaceText}`
    const imageUrl = post.body.marketplacePhotoUrl

    testoDelPost += post.comments
    .map(comment => `Autore: ${comment.author.userName} Commento: ${comment.body}`)
    .join('\n')

    try {
      const response = await fetch('/api/marketplacepost/commentmarketplacepost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtSecret}`
        },
        body: JSON.stringify({ testoDelPost, imageUrl, authorname }),
      })

      if(response.ok){
        const data = await response.json()
        return data.text
      }
    } catch (error) {
      return FakePostCommentTextFactory();
    }
    return FakePostCommentTextFactory();
  } else if (post.body !== undefined && typeof post.body === 'object' && 'imagePostText' in post.body) {

    let testoDelPost = `Testo del post: ${post.author.userName} scrive:\n${post.body.imagePostText}`
    const imageUrl = post.body.imageUrl

    testoDelPost += post.comments
    .map(comment => `Autore: ${comment.author.userName} Commento: ${comment.body}`)
    .join('\n')

    try {
      const response = await fetch('/api/marketplacepost/commentmarketplacepost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtSecret}`
        },
        body: JSON.stringify({ testoDelPost, imageUrl, authorname }),
      })

      if(response.ok){
        const data = await response.json()
        return data.text
      }
    } catch (error) {
      return FakePostCommentTextFactory();
    }
    return FakePostCommentTextFactory();
  } else if (post.body !== undefined && typeof post.body === 'object' && 'videoText' in post.body) {
      
    return FakePostCommentTextFactory();
  } else if (post.body !== undefined && typeof post.body === 'object' && 'rewtweetText' in post.body) {
    return FakePostCommentTextFactory();
  } else {
     return FakePostCommentTextFactory();
}
}

//Sorteggio a caso di parole
export const FakePostTextFactory = ():NormalPostBody => {
  let fakePostText = ""
  const fakePostSortWords = ['meo', 'meow', 'miao', 'mau', 'hiss', 'hisssss', 'prrrr', 'prrrrra', 'prrraaau', 'prau', 'nyan', 'nya', 
      'meeeooow', 'frrr', 'frrrrrr', 'frau', '(procede a stiracchiarsi)', '* crunch crunch *', '*sniff sniff*', '(si lecca)'
  ]
  const numberOfWords = Math.round(Math.random() * 15+5)
  for (let index = 0; index < numberOfWords; index++) {
      fakePostText += fakePostSortWords[Math.floor(Math.random() * fakePostSortWords.length)] + ' '
  }   
  return {normalPostTex: fakePostText}
}

export const FakePostFactory = async (time: Date, author:UserDetails, num:number): Promise<Post> => {
  let fakePostText = FakePostTextFactory()

    const fakePostComments:PostComment[] = []
    const random = Math.round(Math.random()*100)
    let imageString = ''
    if (random < 20) {
        imageString = await fetchRandomPostFoto()
    }
    return {
        id:num+1,
        author,
        body: fakePostText,
        comments: fakePostComments,
        created_at: time.toISOString(),
        likes: Math.floor(Math.random()*15),
        userliked: false,
        likeProfiles: []
    }
}

// export const fakePostCommentFactory = (commentAuthor:UserDetails, commentedPost:Post, commented_at:string, commentText:string): PostComment => {

//   const postId = commentedPost.comments.length + 1

//   return {
//     id: postId,
//     author: commentAuthor,
//     body: commentText,
//     commented_at: commented_at
//   }
// }

export const fetchRandomPostFoto = async (): Promise<string> => {
    const queryUrl = `/api/storedcatphotos`; 
  
    try {
      const response = await fetch(queryUrl,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${jwtSecret}`  
        },
      });
      if (!response.ok) {
        throw new Error('Errore nella fetch della picture casuale');
      }
      const data = await response.json();
      return data
    } catch (error) {
      console.error(error);
      return '';
    }
}

export const GenerateInitialMarketplaceCluster = async (lastId:number, randomAuthor:UserDetails[]):Promise<Post[]> => {
  const minIntervalInHours = 1000*60*60*3;  // Intervallo minimo tra i post (3 ore)
  const maxIntervalInDays = 86400000 *2;   // Intervallo massimo tra i post (2 giorni)
  const queryUrl = `/api/marketplacepost/initialcluster`;
  const response = await fetch(queryUrl, {
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${jwtSecret}`
    }
  })

  if(response.ok){
    let lastPostTime = new Date().getTime()
    lastPostTime -= generateRandomInterval(minIntervalInHours , maxIntervalInDays )
    const {text, images} = await response.json()
    const returnArray: Post[] = []
    const parsedText: string[] = text.split('#')

    const imageArray = [...images]

    for (let index = 0; index < 3; index++) {

      const body: MarketPlacePostString = {
        marketplacePhotoUrl: imageArray[index],
        marketplaceTitle: parsedText[index],
        marketPlaceText: parsedText[(index+3)],
        marketplacePrice: parsedText[(index+6)]
      }

      lastId++

      const post:Post = {
        id: lastId,
        author: randomAuthor[index],
        body: body,
        comments: [],
        created_at: new Date(lastPostTime).toISOString(),
        likes: 0,
        userliked: false,
        likeProfiles: []
      }      

      returnArray.push(post)
      lastPostTime -= generateRandomInterval(minIntervalInHours , maxIntervalInDays )
    }

    return returnArray
  } else {
    console.error('Errore nella fetch dei post marketplace casuale');
    return []
  }
}

export const generateXVideoPosts = async (x: number, inputAuthors: CasualUser[]): Promise<Post[]> => {
  const returnArray: Post[] = [];

  const shuffledArray = inputAuthors.sort(() => Math.random() - 0.5);
  const minIntervalInHours = 1000 * 60 * 60 * 3;  // 3 ore
  const maxIntervalInDays = 86400000 * 2;   // 2 giorni

  let lastPostTime = new Date().getTime();
  lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays);

  const queryUrl = `/api/videostreaming/geturl?qty=` + x;
  const limit = Math.min(x, shuffledArray.length);

  const response = await fetch(queryUrl, {
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${jwtSecret}`
    }
  });

  if (!response.ok) {
    console.error('Errore nella fetch dei reel');
    return [];
  }

  const data = await response.json();

  for (let index = 0; index < limit; index++) {
    const newBody: VideoPostBody = {
      videoUrl: data.returnArray[index],
      videoText: data.returnArray[index],
      generativeContext: ""
    };

    const newPost: Post = {
      id: returnArray.length, 
      author: {
        userName: shuffledArray[index].name,
        profilepicture: shuffledArray[index].profilePic,
        coverPhotoUrl: shuffledArray[index].coverPhotoUrl,
      },
      body: newBody,
      comments: [],
      created_at: new Date(lastPostTime).toISOString(),
      likes: 0,
      userliked: false,
      likeProfiles: []
    };

    returnArray.push(newPost);
    lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays);
  }

  return returnArray;
};

export const generateXMutedImagePosts = (x:number, inputAuthors: CasualUser[]):Post[] => {

  const minIntervalInHours = 1000 * 60 * 60 * 3;  // 3 ore
  const maxIntervalInDays = 86400000 * 2;   // 2 giorni

  let lastPostTime = new Date().getTime();
  lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays);
  
  const returnArray: Post[] = [];
  let limit = 0
  if(x > inputAuthors.length){
    limit = inputAuthors.length
  } else {
    limit = x
  }

  for (let index = 0; index < x; index++) {
    const muted = 70 > Math.floor(Math.random() * 100)
    const newBody: ImagePostBody = {
      imageUrl: inputAuthors[index].profilePic,
      generativeContext: "",
      imagePostText: muted?'':FakePostCommentTextFactory()
    }
    const newPost:Post = {
      id: inputAuthors[index].posts.length,
      author: {
        userName: inputAuthors[index].name,
        profilepicture: inputAuthors[index].profilePic,
        coverPhotoUrl: inputAuthors[index].coverPhotoUrl,
      },
      body: newBody,
      comments: [],
      created_at: new Date(lastPostTime).toISOString(),
      likes: 0,
      userliked: false,
      likeProfiles: []
    }
    returnArray.push(newPost)
    lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays)
  }

  return returnArray
}

export const create3ImagePostsNoAI = async (inputAuthors: CasualUser[]):Promise<Post[]> => {
  const returnArray: Post[] = []
  const minIntervalInHours = 1000 * 60 * 60 * 3;  // 3 ore
  const maxIntervalInDays = 86400000 * 2;   // 2 giorni
  const shuffledArray = inputAuthors.sort(() => Math.random() - 0.5);
  let lastPostTime = new Date().getTime();
  lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays);
  for (let index = 0; index < 3; index++) {
    const random = 70 < Math.floor(Math.random() * 100)
    const newBody: ImagePostBody = {
      imageUrl: await fetchRandomPostFoto(),
      imagePostText: random?FakePostCommentTextFactory():'',
      generativeContext: ""
    }    
    const newPost:Post = {
      id: returnArray.length,
      author: {
        userName: shuffledArray[index].name,
        profilepicture: shuffledArray[index].profilePic,
        coverPhotoUrl: shuffledArray[index].coverPhotoUrl,
      },
      body: newBody,
      comments: [],
      created_at: new Date(lastPostTime).toISOString(),
      likes: 0,
      userliked: false,
      likeProfiles: []
    }

    returnArray.push(newPost)
    lastPostTime -= generateRandomInterval(minIntervalInHours, maxIntervalInDays)
  }

  return returnArray
}