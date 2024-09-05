import { pexelPayload } from "./StorageDataTypes"

export const sortRandomProfilePictureQuery = () => {


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

export const fetchRandomProfilePictureCat = async (query:string):Promise<string> => {
    const queryUrl = `/api/pexelprofilepicture?query=${query}`; 
  
    try {
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error('Errore nella fetch della nuova profile picture casuale');
      }
  
      const data = await response.json();
      return data.photos[0].src.tiny;
    } catch (error) {
      console.error(error);
      // Immagine di fallback in caso di errore
      return 'https://images.pexels.com/photos/3974516/pexels-photo-3974516.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280';
    }
  };
  