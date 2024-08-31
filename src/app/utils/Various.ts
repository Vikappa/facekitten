import { pexelPayload } from "./StorageDataTypes"

export const sortRandomProfilePictureQueryUrl = () => {

    const basePexelUrl = 'https://api.pexels.com/v1/search?query='

    const sortRandomCatSize = (): string => {
        const catSizes = ['cat', 'kitten', 'leopard', 'mouser', 'feline']
        const randomIndex = Math.floor(Math.random() * catSizes.length)
        return catSizes[randomIndex]
    }

    const sortRandomCatColor = (): string => {
        const catColors = ['black', 'white', 'orange', 'gray', 'spotted']
        const randomIndex = Math.floor(Math.random() * catColors.length)
        return catColors[randomIndex]
    }

    const randomCatQuery: string = `${sortRandomCatSize()}+${sortRandomCatColor()}`

    const finalPexelUrl = `${basePexelUrl}${randomCatQuery}&per_page=1&orientation=portrait&size=small`

    return finalPexelUrl
}

export const fetchRandomProfilePictureCat = async (queryUrl: string):Promise<pexelPayload> => {
    const response = await fetch(queryUrl, {
        headers: {
            Authorization: `Bearer ${process.env.PEXEL_API_KEY}`
        }
    });

    const data = await response.json();
    return data;
}

export const getProfilePicture = async ():Promise<string> => {
    return fetchRandomProfilePictureCat(sortRandomProfilePictureQueryUrl())
        .then(data => {
            return data.photos[0].src.tiny
        })
        .catch(error => {
            console.log('Errore nella fetch della nuova profile picture casuale')
            return 'https://images.pexels.com/photos/3974516/pexels-photo-3974516.jpeg?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280'
        })
}
