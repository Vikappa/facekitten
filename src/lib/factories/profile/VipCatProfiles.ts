import { supabase } from '@/lib/supabaseClient'
import {
  PROFILE_PUBLIC_SAFE_SELECT,
  Profile,
  ProfilePublicDb,
  mapRows,
  toProfileDto,
} from '@/types/db'

const vipIds = process.env.NEXT_PUBLIC_VIPIDS?.split(';').filter(Boolean) ?? []

export async function fetchMissingVipProfiles(currentIds: string[]): Promise<Profile[]> {
  const currentIdSet = new Set(currentIds)
  const toGet = vipIds.filter((vipId) => !currentIdSet.has(vipId))

  if (toGet.length === 0) return []

  const { data, error } = await supabase
    .from('Profile')
    .select(PROFILE_PUBLIC_SAFE_SELECT)
    .in('id', toGet)
    .returns<ProfilePublicDb[]>()

  if (error) throw error

  return mapRows(data, toProfileDto)
}
