import { VercelLogger } from '@/lib/logging/VercelLogger'
import { SendEmail } from '@/lib/services/emailsender/EmailSender'
import { createSupabaseAdminClient } from '@/lib/supabase/serverAdminClient'
import type { ProfileInsert, RegistrationCodeInsert } from '@/types/db'
import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

interface CreateProfileBody {
  name?: string
  email?: string
  password?: string
}

export async function POST(req: NextRequest) {
  let body: CreateProfileBody

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email, password' },
      { status: 400 }
    )
  }

  let supabase: ReturnType<typeof createSupabaseAdminClient>

  try {
    supabase = createSupabaseAdminClient()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Supabase config error'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { username: name },
  })
  
  VercelLogger("Richiesta di registrazione profilo ricevuta " + JSON.stringify({ email, name }))
  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? 'Could not create auth user' },
      { status: 400 }
    )
  }

  const profileToInsert: ProfileInsert = {
    id: authData.user.id,
    email,
    username: name,
    avatarUrl: '',
    bannerUrl: '',
    bio: '',
    confirmedAccount: false,
  }

  const { data: createdProfile, error: profileError } = await supabase
    .from('Profile')
    .insert(profileToInsert)
    .select('*')
    .single()

    
    
    if (profileError || !createdProfile) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      VercelLogger("Errore durante la creazione del profilo, utente auth eliminato " + JSON.stringify({ email, name, error: profileError?.message }))
      return NextResponse.json(
        { error: profileError?.message ?? 'Could not create profile row' },
        { status: 500 }
      )
    }
    
    VercelLogger("Creazione del profilo completata " + JSON.stringify({ profileToInsert }))

    const registrationRow : RegistrationCodeInsert = {
      code:createRegistrationCode(),
      profile: createdProfile.id,
    }

    const { data: createdRegistration, error: registrationError } = await supabase
      .from('registrationcodes')
      .insert(registrationRow)
      .select('*')
      .single()

    if (registrationError || !createdRegistration) {
      VercelLogger("Errore durante la creazione del codice di registrazione " + JSON.stringify({ error: registrationError?.message }))
    }

    await SendEmail(email, createdRegistration?.code ?? "ERRORE", name, emailText(name, createdRegistration?.code ?? "ERRORE"), emailHTML(name, createdRegistration?.code ?? "ERRORE"))

  return NextResponse.json(createdRegistration?.code, { status: 201 })
}


function createRegistrationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = randomBytes(8)
  
  let result = ''
  for (let i = 0; i < bytes.length; i++) {
    result += chars[bytes[i] % chars.length]
  }

  return result
}


export const emailText = (nome: string, token: string) => {
  return `Ciao ${nome}, il tuo codice di conferma per completare la registrazione è: ${token}`;
};

export const emailHTML = (nome: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profileregistration/verify/`;
  return `
        <html>
            <head>
                <style>

                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <h1 class="ciao">Ciao ${nome}!</h1>
                        <p>Codice di conferma per completare la registrazione: ${token}</p>
                        <a href="${verificationUrl}" class="verification-link">Completa la registrazione</a>
                    </div>
                </div>
            </body>
        </html>
    `;
};
