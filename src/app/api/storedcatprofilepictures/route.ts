import { NextResponse } from 'next/server';
import { picIndexes } from '../../../../public/storedcatprofilepictures/imgs/fileindexer';

export const dynamic = 'force-dynamic';

export function GET() {
  const randomPic = picIndexes[Math.floor(Math.random() * picIndexes.length)];

  return NextResponse.json(randomPic);
}
