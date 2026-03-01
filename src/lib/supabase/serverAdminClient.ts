import 'server-only'

import type { Database } from '@/types/database.types'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const getSupabaseAdminEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase env vars mancanti: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return { url, serviceRoleKey }
}

export const createSupabaseAdminClient = (): SupabaseClient<Database> => {
  const { url, serviceRoleKey } = getSupabaseAdminEnv()

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
