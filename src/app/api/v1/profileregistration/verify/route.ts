import { VercelLogger } from '@/lib/logging/VercelLogger'
import { issueSessionCookie } from '@/lib/Security/SessionSecurity'
import { createSupabaseAdminClient } from '@/lib/supabase/serverAdminClient'
import { NextRequest, NextResponse } from 'next/server'

type VerifyPayload = {
  code?: string
}

export async function POST(req: NextRequest) {
  let body: VerifyPayload

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const code = body.code?.trim()

  if (!code) {
    return NextResponse.json({ error: 'Missing required field: code' }, { status: 400 })
  }

  if (code === 'ERRORE') {
    return NextResponse.json({ error: "Errore durante l'invio dell'email" }, { status: 500 })
  }

  if (code === 'CODICE NON VALIDO') {
    return NextResponse.json({ error: 'Codice di verifica non valido' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  const { data: registration, error: registrationError } = await supabase
    .from('registrationcodes')
    .select('id, code, profile')
    .eq('code', code)
    .single()

  if (registrationError || !registration) {
    VercelLogger(
      'Errore durante la verifica del codice di registrazione ' +
        JSON.stringify({ error: registrationError?.message, code })
    )
    return NextResponse.json({ error: 'Codice di verifica non valido' }, { status: 400 })
  }

  if(registration.profile === null) {
    return NextResponse.json({ error: 'Codice di verifica non valido' }, { status: 400 })
  }

  const profileToUpdate = supabase.from('Profile')
    .update({ confirmedAccount: true })
    .eq('id', registration.profile)
    .select('id, email')
    .single()

  const { data: updatedProfile, error: updateError } = await profileToUpdate
  
  if(updateError || !updatedProfile) {
    VercelLogger(
      'Errore durante l\'aggiornamento del profilo alla conferma ' +
        JSON.stringify({ error: updateError?.message, code })
    )
    return NextResponse.json({ error: 'Errore durante la verifica del codice' }, { status: 500 })
  }

  const response = NextResponse.json(
    { message: 'Codice di verifica valido', profileId: updatedProfile.id },
    { status: 200 }
  )

  await issueSessionCookie(response, {
    profileId: updatedProfile.id,
    email: updatedProfile.email,
  })

  return response
}
