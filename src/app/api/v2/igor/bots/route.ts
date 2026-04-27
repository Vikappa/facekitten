import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/serverAdminClient'
import { hashProfilePassword } from '@/lib/Security/ProfilePasswordSecurity'
import { igorUnauthorized, verifyIgorToken } from '@/lib/Security/IgorAuth'
import { VercelLogger } from '@/lib/logging/VercelLogger'
import { BotInsert, ProfileInsert } from '@/types/db'

// DTO restituito dal GET
interface PostSummaryDto {
  id: string
  content: string | null
  extraContent: string | null
  mediaUrl: string | null
  postType: string | null
  createdAt: string
}

interface GattiBotProfileDto {
  botId: string
  isActive: boolean
  createdAt: string
  profile: {
    id: string
    username: string | null
    email: string | null
    avatarUrl: string | null
    bannerUrl: string | null
    bio: string | null
    confirmedAccount: boolean | null
    createdAt: string
    posts: PostSummaryDto[]
  } | null
}

const BOT_WITH_PROFILE_SELECT = `
  id,
  is_active,
  created_at,
  Profile!bots_profileId_fkey (
    id,
    username,
    email,
    avatarUrl,
    bannerUrl,
    bio,
    confirmedAccount,
    created_at,
    post!Post_authorId_fkey (
      id,
      content,
      extraContent,
      mediaUrl,
      postType,
      created_at
    )
  )
` as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGattiBotProfileDto(row: any): GattiBotProfileDto {
  const profile = row.Profile ?? null
  return {
    botId: row.id,
    isActive: row.is_active,
    createdAt: row.created_at,
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          bannerUrl: profile.bannerUrl,
          bio: profile.bio,
          confirmedAccount: profile.confirmedAccount,
          createdAt: profile.created_at,
          posts: (profile.post ?? []).map((p: any) => ({
            id: p.id,
            content: p.content,
            extraContent: p.extraContent,
            mediaUrl: p.mediaUrl,
            postType: p.postType,
            createdAt: p.created_at,
          })),
        }
      : null,
  }
}

// ——————————————————————————————————————————————————————————

interface RegisterBotBody {
  username?: string
  password?: string
  email?: string
}

export async function POST(req: NextRequest) {
  if (!verifyIgorToken(req)) return igorUnauthorized()

  let body: RegisterBotBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const username = body.username?.trim()
  const email = body.email?.trim().toLowerCase()
  const { password } = body

  if (!username || !password || !email) {
    return NextResponse.json(
      { error: 'username, email e password sono obbligatori' },
      { status: 400 }
    )
  }

  let passwordHash: string
  try {
    passwordHash = await hashProfilePassword(password)
  } catch {
    return NextResponse.json({ error: 'Errore durante hashing password' }, { status: 500 })
  }

  const supabase = createSupabaseAdminClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  })

  if (authError || !authData.user) {
    if (authError?.message?.toLowerCase().includes('already')) {
      return NextResponse.json({ error: 'Email già in uso' }, { status: 409 })
    }
    VercelLogger('Errore creazione auth bot: ' + (authError?.message ?? 'unknown'))
    return NextResponse.json(
      { error: authError?.message ?? 'Errore creazione utente auth' },
      { status: 400 }
    )
  }

  const profileId = authData.user.id

  const profileToInsert: ProfileInsert = {
    id: profileId,
    email,
    username,
    avatarUrl: '',
    bannerUrl: '',
    bio: '',
    confirmedAccount: true,
    password: passwordHash,
  }

  const { error: profileError } = await supabase.from('Profile').insert(profileToInsert)

  if (profileError) {
    await supabase.auth.admin.deleteUser(profileId)
    VercelLogger('Errore creazione profile bot: ' + profileError.message)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const botToInsert: BotInsert = {
    username,
    password_hash: passwordHash,
    profileId,
  }

  const { data: botData, error: botError } = await supabase
    .from('bots')
    .insert(botToInsert)
    .select('id, username, profileId, is_active, created_at')
    .single()

  if (botError) {
    await supabase.auth.admin.deleteUser(profileId)
    if (botError.code === '23505') {
      return NextResponse.json({ error: 'Username già in uso nella tabella bots' }, { status: 409 })
    }
    VercelLogger('Errore inserimento bot: ' + botError.message)
    return NextResponse.json({ error: botError.message }, { status: 500 })
  }

  return NextResponse.json(botData, { status: 201 })
}

export async function GET(req: NextRequest) {
  if (!verifyIgorToken(req)) return igorUnauthorized()

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)))
  const offset = (page - 1) * pageSize

  const supabase = createSupabaseAdminClient()

  const { data, error, count } = await supabase
    .from('bots')
    .select(BOT_WITH_PROFILE_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    VercelLogger('Errore fetch bots: ' + error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: (data ?? []).map(toGattiBotProfileDto),
    page,
    pageSize,
    total: count ?? 0,
  })
}
