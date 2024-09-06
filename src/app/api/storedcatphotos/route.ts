import { NextResponse } from 'next/server';
import { postImgIndexes } from '../../../../public/storedcatphotos/imgs/postImgIndexes';

export const dynamic = 'force-dynamic';

export function GET() {
  const randomPic = postImgIndexes[Math.floor(Math.random() * postImgIndexes.length)];

  return NextResponse.json(randomPic);
}
