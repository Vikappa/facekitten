import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars mancanti: controlla NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export type SupabaseProfileRow = {
  id: string
  created_at: string
  username: string | null
  avatarUrl: string | null
  bio: string | null
  bannerUrl: string | null
  createdAt: string | null
  updatedAt: string | null
  postIds: string[] | null
  followingIds: string[] | null
  commentsIds: string[] | null
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey)
