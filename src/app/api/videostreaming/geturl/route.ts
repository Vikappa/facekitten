import { NextApiRequest, NextApiResponse } from 'next'
import { postVideoIndexes } from '../../../../../public/storedcatvideos/video/postVideosIndexes'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const jwtSecret = process.env.NEXT_PUBLIC_SELF

export async function GET(req: NextRequest) {   
    // Controlla se il token è valido
    const token = req.headers.get('Authorization')
    if (!token || token !== `Bearer ${jwtSecret}`) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

  const qty = Number(req.nextUrl.searchParams.get('qty'))
  const returnArray: string[] = []
  for (let index = 0; index < qty; index++) {
    returnArray.push(postVideoIndexes[Math.floor(Math.random() * postVideoIndexes.length)])
  }
  // Seleziona casualmente un file dall'array postVideoIndexes
  const fileName: string = postVideoIndexes[Math.floor(Math.random() * postVideoIndexes.length)]

  // Genera l'URL del video che punta all'endpoint di streaming
  const filename = `${path.basename(fileName)}`
  // Restituisci l'URL del video
  return NextResponse.json({ returnArray })
}
