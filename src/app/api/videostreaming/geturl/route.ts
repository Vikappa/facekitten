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

  // Seleziona casualmente un file dall'array postVideoIndexes
  const fileName: string = postVideoIndexes[Math.floor(Math.random() * postVideoIndexes.length)]

  // Genera l'URL del video che punta all'endpoint di streaming
  const filename = `${path.basename(fileName)}`

  // Restituisci l'URL del video
  return NextResponse.json({ filename })
}
