import { UserDetails } from "../StorageDataTypes"
const jwtSecret = process.env.NEXT_PUBLIC_SELF

export const sortRandomAccountPictureQuery = () => {


    const sortRandomCatSize = (): string => {
        const catSizes = ['cat', 'kitten', 'feline']
        const randomIndex = Math.floor(Math.random() * catSizes.length)
        return catSizes[randomIndex]
    }

    const sortRandomCatColor = (): string => {
        const catColors = ['black', 'white', 'orange', 'gray','grey', 'spotted', '']
        const randomIndex = Math.floor(Math.random() * catColors.length)
        return catColors[randomIndex]
    }

    const randomCatQuery: string = `${sortRandomCatSize()}+${sortRandomCatColor()}`

    return randomCatQuery
}

// const fetchRandomPictureCat = async (query: string): Promise<string> => {
//     const queryUrl = `/api/pexelprofilepicture?query=${query}`; 
  
//     try {
//       const response = await fetch(queryUrl);
//       if (!response.ok) {
//         throw new Error('Errore nella fetch della nuova profile picture casuale');
//       }
//       const data = await response.json();
//       const index = Math.floor(Math.random() * data.photos.length) 
//       return data.photos[index].src.tiny;
//     } catch (error) {
//       console.error(error);
//       // Immagine di fallback in caso di errore
//       return 'https://images.pexels.com/photos/3974516/pexels-photo-3974516.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280';
//     }
// }

export const fetchRandomPictureCat = async (): Promise<string> => {
    const queryUrl = `/api/storedcatprofilepictures`; 
  
    try {
      const response = await fetch(queryUrl, {
        headers: {
          'Authorization': `Bearer ${jwtSecret}`,
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Errore nella fetch della nuova profile picture casuale');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      // Immagine di fallback in caso di errore
      return 'https://images.pexels.com/photos/3974516/pexels-photo-3974516.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280';
    }
}

const generatedNames = new Set<string>(); 

const createRandomUserName = (): string => {
    const names = [
        "Micio", "Luna", "Felix", "Tigro", "Leo", "Nina", "Vladdalo", "Zoe", "Salem", "Mila", 
        "Oliver", "Simba", "Miciomicio", "Bella", "Charlie", "Sophie", "Jasper", "Maya", "Oreo", "Misty", 
        "Loki", "Chloe", "Ginger", "Lily", "Shadow", "Bernardo", "Muffin", "Smokey", "Max", "Sasha", "Pepper", 
        "Molly", "Tom", "Daisy", "Toby", "Fluffy", "Thor", "Fiona", "Milo", "Luna", "Gizmo", "Lola",
        "Socks", "Rusty", "Juno",  "Gatto",  "Dante", "Leomawrdo", "Tiger", "Mirtilla", "Margherita", "Bianca"
    ];

    const surnames = [
        "Rossi", "Neri", "Bianchi", "Grigi", "Tigrato", "Maculato", "Silvestri", "DiCaprio", "Pallido", "Striato", 
        "Criminale di Guerra", "Balzano", "Veloce", "Zampadoro", "CodaLunga", "Zampini", "Sonnacchioso", "Furtivo", "Silenzioso", "McCodino", "Notturno", 
        "Sbuffante", "Miaomiao", "Agile", "Sornione", "Lucente", "Panciuto", "Vagabondo", "Guizzante", "Pennellato", "Artiglio", 
        "Sospetto", "Nebuloso", "Vibrisse", "Calzato", "Sfuggente", "Ramingo", "Screziato", "Zampone", "Stravagante", "Occhioni", 
        "Fuggente", "Guardingo", "McFurr", "Scattante", "Misterioso", "Serafico", "Saltatore", "Indomito", "Vispo", "Cauto"
    ];

    let randomName: string;
    let randomSurname: string;
    let fullName: string;

    do {
        randomName = names[Math.floor(Math.random() * names.length)];
        randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
        fullName = `${randomName} ${randomSurname}`;
    } while (generatedNames.has(fullName))

    generatedNames.add(fullName)

    return fullName
}


export const CreateFakeUser = async (): Promise<UserDetails> => {
    const userName = createRandomUserName();
    const profilepicture = await fetchRandomPictureCat()
    const coverPhotoUrl = await fetchRandomCoverPhoto()
    return {
        userName: userName,
        profilepicture: profilepicture,
        coverPhotoUrl: coverPhotoUrl
    };
}


export const fetchRandomCoverPhoto = async (): Promise<string> => {
    const queryUrl = `/api/storedcatcoverphoto`; 
  
    try {
      const response = await fetch(queryUrl,{
        headers: {
          'Authorization': `Bearer ${jwtSecret}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Errore nella fetch della nuova cover photo casuale');
      }
      const data = await response.json();
      return data
    } catch (error) {
      console.error(error);
      // Immagine di fallback in caso di errore
      return 'https://images.pexels.com/photos/3974516/pexels-photo-3974516.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280';
    }
}