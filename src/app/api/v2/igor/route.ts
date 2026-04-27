import { NextRequest, NextResponse } from 'next/server'
import { igorUnauthorized, verifyIgorToken } from '@/lib/Security/IgorAuth'

export function GET(req: NextRequest) {
  if (!verifyIgorToken(req)) return igorUnauthorized()
  return NextResponse.json({ status: 'ok', version: 'v2', service: 'igor' })
}

