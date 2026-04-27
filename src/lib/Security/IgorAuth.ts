import 'server-only'
import { NextRequest, NextResponse } from 'next/server'

export const IGOR_TOKEN_NAME = 'IGOR_TOKEN'

export function verifyIgorToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return false

  const token = authHeader.slice(7).trim()
  const expected = process.env[IGOR_TOKEN_NAME]?.trim()

  if (!expected || !token) return false

  return token === expected
}

export function igorUnauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
