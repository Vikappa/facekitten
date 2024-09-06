import { pexelPayload } from '@/app/utils/StorageDataTypes';
import { NextRequest, NextResponse } from 'next/server';
import { picIndexes } from '../../../../public/storedcatprofilepictures/imgs/fileindexer'

export function GET() {

    const randomIndex = Math.floor(Math.random() * picIndexes.length)
    const randomPic = picIndexes[randomIndex]

    return NextResponse.json(randomPic)
}