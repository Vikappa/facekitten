import 'server-only'
import { NextRequest, NextResponse } from 'next/server'

import { igorUnauthorized, verifyIgorToken } from '@/lib/Security/IgorAuth'
import { createSupabaseAdminClient } from '@/lib/supabase/serverAdminClient'

export async function GET(req: NextRequest) {
  if (!verifyIgorToken(req)) return igorUnauthorized()

  const query = (req.nextUrl.searchParams.get('query') ?? '').trim()

  if (query.length < 2) {
    return NextResponse.json([])
  }

  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('Profile')
    .select('id, username, avatarUrl')
    .ilike('username', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Errore ricerca profili in api/v2/search/profiles:', error)
    return NextResponse.json(
      { code: 'PROFILES_FETCH_ERROR', error: 'Errore interno' },
      { status: 500 }
    )
  }

  return NextResponse.json(data ?? [])
}
