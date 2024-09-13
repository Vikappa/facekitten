import { NextRequest, NextResponse } from 'next/server';
import { picIndexes } from '../../../../public/storedcatprofilepictures/imgs/fileindexer';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (token !== process.env.NEXT_PUBLIC_SELF) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  const randomPic = picIndexes[Math.floor(Math.random() * picIndexes.length)];

  return NextResponse.json(randomPic);
}
