import { NextRequest, NextResponse } from 'next/server';
import { coverPhotoIndexes } from '../../../../public/storedcatcoverphotos/coverPhotoIndexes';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (token !== process.env.NEXT_PUBLIC_SELF) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  const randomPic = coverPhotoIndexes[Math.floor(Math.random() * coverPhotoIndexes.length)];

  return NextResponse.json(randomPic);
}
