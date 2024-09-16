import { NextRequest, NextResponse } from 'next/server';
import { marketplaceImgIndexes } from '../../../../public/storedcatmarketplacephotos/marketplacesImgIndexes';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { qty } = await request.json()
  const authHeader = request.headers.get('Authorization')
  const token = authHeader && authHeader.split(' ')[1]
  if (token !== process.env.NEXT_PUBLIC_SELF) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if(qty===1){
    return NextResponse.json([marketplaceImgIndexes[Math.floor(Math.random() * marketplaceImgIndexes.length)]]);
  } else { 
    return NextResponse.json([marketplaceImgIndexes[Math.floor(Math.random() * marketplaceImgIndexes.length)],marketplaceImgIndexes[Math.floor(Math.random() * marketplaceImgIndexes.length)],marketplaceImgIndexes[Math.floor(Math.random() * marketplaceImgIndexes.length)] ]);
  }
}
