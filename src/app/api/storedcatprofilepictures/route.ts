import { pexelPayload } from '@/app/utils/StorageDataTypes';
import { NextRequest, NextResponse } from 'next/server';
import { picIndexes } from '../../../../public/storedcatprofilepictures/imgs/fileindexer'

export function GET() {

    const randomPic = picIndexes[Math.floor(Math.random() * picIndexes.length)]

    return NextResponse.json(randomPic)
}