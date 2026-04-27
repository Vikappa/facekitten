import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/serverAdminClient'
import { igorUnauthorized, verifyIgorToken } from '@/lib/Security/IgorAuth'
import { VercelLogger } from '@/lib/logging/VercelLogger'
import { NOTIFICATION_SAFE_SELECT, NotificationDb, NotificationDto, toNotificationDto } from '@/types/db'

interface ProfileNotificationsDto {
  profileId: string
  notifications: NotificationDto[]
}

export async function GET(req: NextRequest) {
  if (!verifyIgorToken(req)) return igorUnauthorized()

  const raw = req.nextUrl.searchParams.get('profileIds') ?? ''
  const profileIds = raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (profileIds.length === 0) {
    return NextResponse.json(
      { error: 'Il parametro profileIds è obbligatorio (valori separati da virgola)' },
      { status: 400 }
    )
  }

  if (profileIds.length > 100) {
    return NextResponse.json(
      { error: 'Massimo 100 profileIds per richiesta' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SAFE_SELECT)
    .in('to', profileIds)
    .order('created_at', { ascending: false })

  if (error) {
    VercelLogger('Errore fetch notifiche bots: ' + error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const grouped = new Map<string, NotificationDto[]>(profileIds.map((id) => [id, []]))

  for (const row of (data ?? []) as NotificationDb[]) {
    const profileId = row.to
    if (!profileId || !grouped.has(profileId)) continue
    grouped.get(profileId)!.push(toNotificationDto(row))
  }

  const result: ProfileNotificationsDto[] = profileIds.map((profileId) => ({
    profileId,
    notifications: grouped.get(profileId) ?? [],
  }))

  return NextResponse.json({ data: result })
}
