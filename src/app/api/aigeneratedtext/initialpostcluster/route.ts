
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NewsApiPayload } from '@/app/utils/StorageDataTypes';

const GoogleApyKey = process.env.GOOGLE_GEMINI_API_KEY;
const newApiKey = process.env.NEWS_API_KEY
export const dynamic = 'force-dynamic';

const fallbackArray = [
    "Titolo: Gatto rimane sull'albero, Notizia: Momenti di terrore in giardino, il gatto salito sull'albero non riesce a scendere. I pompieri sono intervenuti per riportarlo a terra.",
    "Titolo: Gatto eroe salva famiglia da incendio, Notizia: Un gatto ha allertato i suoi proprietari svegliandoli in piena notte, permettendo alla famiglia di sfuggire a un incendio scoppiato in cucina.",
    "Titolo: Gatto viaggiatore ritrovato a 500 km da casa, Notizia: Un gatto scomparso è stato ritrovato a 500 km dalla sua abitazione dopo una settimana di ricerche disperate.",
    "Titolo: Gatto diventa sindaco onorario, Notizia: In un piccolo villaggio, un gatto è stato eletto sindaco onorario per la sua presenza costante nelle riunioni di quartiere.",
    "Titolo: Gatto scopre antica moneta sotto il divano, Notizia: Un gatto curioso ha portato alla luce una moneta antica nascosta sotto un divano, sorprendendo i proprietari e gli archeologi."
];

const casualThemes = () => {
    const temi = [
        '&q=attualità', 
        '&q=gatti', 
        '&q=informatica',
        '&q=videogiochi',
        '&q=lavoro',
        '&q=finanza',
        '&q=musica',
        '&q=cinema',
        '&q=viaggi',
        '&q=scienza',
        '&q=libri'
    ];

    const numTemi = Math.floor(Math.random() * 4) + 1;
    const temiCasuali = temi.sort(() => 0.5 - Math.random());
    const temiSelezionati = temiCasuali.slice(0, numTemi);

    return temiSelezionati.join('');
};



const newResume = async (): Promise<string[]> => {
    try {
        const response = await fetch('https://newsapi.org/v2/everything?pageSize=12&language=it'+casualThemes(), {
            method: 'GET',
            headers: {
                authorization: `bearer ${newApiKey}`
            }
        });
        let data: NewsApiPayload = await response.json();
        data.articles.sort(() => 0.5 - Math.random());
        const news = data.articles.map(article => {
            return `Titolo: ${article.title}, Notizia: ${article.description}`;
        });
        return news;
    } catch (error) {
        console.error('Error:', error);
        return fallbackArray;
    }
};

export async function GET(req: NextRequest) {
    const news = await newResume();

    const prompt = `
    In un social network, facekitten, sono iscritti solo gatti. Scrivi 20 testi di post di pareri di gatti su notizie di attualità.
    Di seguito ti fornisco una serie di titoli e notizie di attualità da usare come argomento per i post.
    Ecco le notizie:
    ${news}
    Scrivi dei post variegati e originali. Sii coinvolgente e divertente. Esprimiti in italiano, usando anche versi di gatti (miao, prrr, frrr, nyan nya ecc).
    La risposta deve contenere puramente un array di stringhe di testi in formato JSON. Evita ogni altro tipo di intestazione.
     `;

    if (GoogleApyKey) {
        try {
            const genAI = new GoogleGenerativeAI(GoogleApyKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);

            const generatedText = result.response

            return new NextResponse(
                 generatedText.text() ,
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch (error) {
            console.error('Error generating content:', error);
            return new NextResponse(
                JSON.stringify({ error: "Generation error" }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
    }

    return new NextResponse(
        JSON.stringify({ error: "API key missing" }),
        {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}
