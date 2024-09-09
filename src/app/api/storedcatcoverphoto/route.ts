import { NextResponse } from 'next/server';
import { coverPhotoIndexes } from '../../../../public/storedcatcoverphotos/coverPhotoIndexes';

export const dynamic = 'force-dynamic';

export function GET() {
  const randomPic = coverPhotoIndexes[Math.floor(Math.random() * coverPhotoIndexes.length)];

  return NextResponse.json(randomPic);
}
