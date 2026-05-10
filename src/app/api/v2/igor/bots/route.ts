import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/serverAdminClient'
import { hashProfilePassword } from '@/lib/Security/ProfilePasswordSecurity'
import { igorUnauthorized, verifyIgorToken } from '@/lib/Security/IgorAuth'
import { VercelLogger } from '@/lib/logging/VercelLogger'
import {
  BotInsert,
  NOTIFICATION_SAFE_SELECT,
  NotificationDb,
  NotificationDto,
  ProfileInsert,
  toNotificationDto,
} from '@/types/db'

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
  posts: PostSummaryDto[]
  notifications: NotificationDto[]
  profile: {
    id: string
    username: string | null
    email: string | null
    avatarUrl: string | null
    bannerUrl: string | null
    bio: string | null
    confirmedAccount: boolean | null
    createdAt: string
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

const BOT_PROFILE_POSTS_LIMIT = 30

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGattiBotProfileDto(row: any, notifications: NotificationDto[] = []): GattiBotProfileDto {
  const profile = row.Profile ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts: PostSummaryDto[] = (profile?.post ?? []).map((p: any) => ({
    id: p.id,
    content: p.content,
    extraContent: p.extraContent,
    mediaUrl: p.mediaUrl,
    postType: p.postType,
    createdAt: p.created_at,
  }))

  return {
    botId: row.id,
    isActive: row.is_active,
    createdAt: row.created_at,
    posts,
    notifications,
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
        }
      : null,
  }
}

function log(tag: string, data?: unknown) {
  VercelLogger(`[igor/bots] ${tag}${data !== undefined ? ' ' + JSON.stringify(data) : ''}`)
}

async function loadNotificationsByProfileId(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  profileIds: string[]
): Promise<{
  notificationsByProfileId: Map<string, NotificationDto[]>
  notifications: NotificationDto[]
}> {
  const notificationsByProfileId = new Map<string, NotificationDto[]>(
    profileIds.map((profileId) => [profileId, []])
  )

  if (profileIds.length === 0) {
    return { notificationsByProfileId, notifications: [] }
  }

  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SAFE_SELECT)
    .in('to', profileIds)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const notifications: NotificationDto[] = []

  for (const row of (data ?? []) as NotificationDb[]) {
    const notification = toNotificationDto(row)
    notifications.push(notification)

    const profileId = row.to
    if (!profileId || !notificationsByProfileId.has(profileId)) continue
    notificationsByProfileId.get(profileId)!.push(notification)
  }

  return { notificationsByProfileId, notifications }
}

// ——————————————————————————————————————————————————————————

interface RegisterBotBody {
  username?: string
  password?: string
  email?: string
}

export async function POST(req: NextRequest) {
  log('POST start', { url: req.url })

  const authHeader = req.headers.get('Authorization')
  log('Authorization header', { present: !!authHeader, prefix: authHeader?.slice(0, 14) })

  if (!verifyIgorToken(req)) {
    log('Token non valido - 401')
    return igorUnauthorized()
  }
  log('Token verificato')

  let body: RegisterBotBody
  try {
    body = await req.json()
    log('Body parsed', { username: body.username, email: body.email, hasPassword: !!body.password })
  } catch (e) {
    log('Errore parsing body', { error: String(e) })
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const username = body.username?.trim()
  const email = body.email?.trim().toLowerCase()
  const { password } = body

  if (!username || !password || !email) {
    log('Campi mancanti', { username: !!username, email: !!email, password: !!password })
    return NextResponse.json(
      { error: 'username, email e password sono obbligatori' },
      { status: 400 }
    )
  }

  let passwordHash: string
  try {
    passwordHash = await hashProfilePassword(password)
    log('Password hashata')
  } catch (e) {
    log('Errore hashing password', { error: String(e) })
    return NextResponse.json({ error: 'Errore durante hashing password' }, { status: 500 })
  }

  let supabase: ReturnType<typeof createSupabaseAdminClient>
  try {
    supabase = createSupabaseAdminClient()
    log('Supabase admin client creato')
  } catch (e) {
    log('Errore creazione Supabase client', { error: String(e) })
    return NextResponse.json({ error: 'Errore configurazione server' }, { status: 500 })
  }

  log('Creazione utente auth', { email, username })
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  })

  if (authError || !authData.user) {
    log('Errore auth.admin.createUser', {
      message: authError?.message,
      status: authError?.status,
      code: (authError as unknown as Record<string, unknown>)?.code,
    })
    if (authError?.message?.toLowerCase().includes('already')) {
      return NextResponse.json({ error: 'Email già in uso' }, { status: 409 })
    }
    return NextResponse.json(
      { error: authError?.message ?? 'Errore creazione utente auth' },
      { status: 400 }
    )
  }

  const profileId = authData.user.id
  log('Utente auth creato', { profileId })

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

  log('Inserimento Profile', { profileId, username, email })
  const { error: profileError } = await supabase.from('Profile').insert(profileToInsert)

  if (profileError) {
    log('Errore inserimento Profile', {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    })
    await supabase.auth.admin.deleteUser(profileId)
    log('Rollback auth utente eseguito', { profileId })
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }
  log('Profile inserito', { profileId })

  const botToInsert: BotInsert = {
    username,
    password_hash: passwordHash,
    profileId,
  }

  log('Inserimento bot', { username, profileId })
  const { data: botData, error: botError } = await supabase
    .from('bots')
    .insert(botToInsert)
    .select('id, username, profileId, is_active, created_at')
    .single()

  if (botError) {
    log('Errore inserimento bots', {
      message: botError.message,
      code: botError.code,
      details: botError.details,
      hint: botError.hint,
    })
    await supabase.auth.admin.deleteUser(profileId)
    log('Rollback auth utente eseguito', { profileId })
    if (botError.code === '23505') {
      return NextResponse.json({ error: 'Username già in uso nella tabella bots' }, { status: 409 })
    }
    return NextResponse.json({ error: botError.message }, { status: 500 })
  }

  log('Bot registrato con successo', { botId: botData.id, username, profileId })
  return NextResponse.json(botData, { status: 201 })
}

export async function GET(req: NextRequest) {
  log('GET start', { url: req.url })

  const authHeader = req.headers.get('Authorization')
  log('Authorization header', { present: !!authHeader, prefix: authHeader?.slice(0, 14) })

  if (!verifyIgorToken(req)) {
    log('Token non valido - 401')
    return igorUnauthorized()
  }
  log('Token verificato')

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)))
  const offset = (page - 1) * pageSize
  log('Parametri paginazione', { page, pageSize, offset })

  let supabase: ReturnType<typeof createSupabaseAdminClient>
  try {
    supabase = createSupabaseAdminClient()
  } catch (e) {
    log('Errore creazione Supabase client', { error: String(e) })
    return NextResponse.json({ error: 'Errore configurazione server' }, { status: 500 })
  }

  log('Esecuzione query bots con profile e post annidati')
  const { data, error, count } = await supabase
    .from('bots')
    .select(BOT_WITH_PROFILE_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('created_at', { ascending: false, referencedTable: 'Profile.post' })
    .limit(BOT_PROFILE_POSTS_LIMIT, { referencedTable: 'Profile.post' })
    .range(offset, offset + pageSize - 1)

  if (error) {
    log('Errore query bots', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const profileIds = Array.from(
    new Set(
      (data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => row.Profile?.id)
        .filter(
          (profileId): profileId is string =>
            typeof profileId === 'string' && profileId.length > 0
        )
    )
  )

  let notificationsByProfileId: Map<string, NotificationDto[]>
  let notifications: NotificationDto[]
  try {
    const notificationResult = await loadNotificationsByProfileId(supabase, profileIds)
    notificationsByProfileId = notificationResult.notificationsByProfileId
    notifications = notificationResult.notifications
  } catch (e) {
    const notificationError = e as { message?: string; code?: string; details?: string; hint?: string }
    log('Errore query notifiche bots', {
      message: notificationError.message,
      code: notificationError.code,
      details: notificationError.details,
      hint: notificationError.hint,
    })
    return NextResponse.json(
      { error: notificationError.message ?? 'Errore recupero notifiche bots' },
      { status: 500 }
    )
  }

  const bots = (data ?? []).map((row) => {
    const profileId = row.Profile?.id
    return toGattiBotProfileDto(
      row,
      typeof profileId === 'string' ? (notificationsByProfileId.get(profileId) ?? []) : []
    )
  })
  const posts = bots.flatMap((bot) => bot.posts)

  log('Query completata', {
    righe: data?.length ?? 0,
    totale: count,
    notifiche: notifications.length,
  })
  return NextResponse.json({
    data: bots,
    posts,
    notifications,
    page,
    pageSize,
    total: count ?? 0,
  })
}
