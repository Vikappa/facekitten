import { pexelPayload } from '@/app/utils/StorageDataTypes';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=portrait&size=small`;

  try {
    const response = await fetch(pexelsApiUrl, {
      headers: {
        Authorization: `${process.env.PEXEL_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.statusText}`); // Log dell'errore
      throw new Error(`Errore nella richiesta all'API di Pexels: ${response.statusText}`);
    }

    const data: pexelPayload = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Internal Server Error: ${(error as Error).message}`); // Log dell'errore
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}