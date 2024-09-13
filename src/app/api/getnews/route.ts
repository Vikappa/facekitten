import { NewsApiPayload } from '@/app/utils/StorageDataTypes';
import { NextRequest, NextResponse } from 'next/server';

const newApiKey = process.env.NEWS_API_KEY
export const dynamic = `force-dynamic`;

const fallbackArray = [
    `Titolo: Gatto rimane sull'albero, Notizia: Momenti di terrore in giardino, il gatto salito sull'albero non riesce a scendere. I pompieri sono intervenuti per riportarlo a terra.`,
    `Titolo: Gatto eroe salva famiglia da incendio, Notizia: Un gatto ha allertato i suoi proprietari svegliandoli in piena notte, permettendo alla famiglia di sfuggire a un incendio scoppiato in cucina.`,
    `Titolo: Gatto viaggiatore ritrovato a 500 km da casa, Notizia: Un gatto scomparso è stato ritrovato a 500 km dalla sua abitazione dopo una settimana di ricerche disperate.`,
    `Titolo: Gatto diventa sindaco onorario, Notizia: In un piccolo villaggio, un gatto è stato eletto sindaco onorario per la sua presenza costante nelle riunioni di quartiere.`,
    `Titolo: Gatto scopre antica moneta sotto il divano, Notizia: Un gatto curioso ha portato alla luce una moneta antica nascosta sotto un divano, sorprendendo i proprietari e gli archeologi.`
];

const casualThemes = () => {
    const temi = [
        `&q=attualità`, 
        `&q=gatti`, 
        `&q=politica`, 
        `&q=tecnologia`,
        `&q=matematica`,
        `&q=videogiochi`,
        `&q=lavoro`,
        `&q=finanza`,
        `&q=musica`,
        `&q=cinema`,
        `&q=viaggi`,
        `&q=scienza`,
        `&q=libri`
    ];

    const numTemi = Math.floor(Math.random() * 4) + 1;
    const temiCasuali = temi.sort(() => 0.5 - Math.random());
    const temiSelezionati = temiCasuali.slice(0, numTemi);

    return temiSelezionati.join(``);
};

const newResume = async (): Promise<string[]> => {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?pageSize=12&language=it`+casualThemes(), {
            method: `GET`,
            headers: {
                authorization: `bearer ${newApiKey}`
            }
        });
        let data: NewsApiPayload = await response.json()
        data.articles.sort(() => 0.5 - Math.random())
        const news = data.articles.map(article => {
            return `Titolo: ${article.title}, Notizia: ${article.description}`
        });
        return news
    } catch (error) {
        console.error(`Error:`, error)
        return fallbackArray
    }
}

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (token !== process.env.NEXT_PUBLIC_SELF) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const news = await newResume()
    return NextResponse.json(news)
}
