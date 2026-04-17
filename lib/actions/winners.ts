'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Uploads a proof screenshot and updates the winner record.
 */
export async function submitProofAction(winnerId: string, formData: FormData) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) return { error: 'Please select an image file to upload.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${winnerId}_${Date.now()}.${fileExt}`

  // 1. Upload to the 'proofs' bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('proofs')
    .upload(fileName, file, {
      upsert: true
    })

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` }

  // 2. Generate the public URL
  const { data } = supabase.storage.from('proofs').getPublicUrl(fileName)
  const publicUrl = data.publicUrl

  // 3. Update the winners table with the proof URL and reset status to pending
  const { error: dbError } = await supabase
    .from('winners')
    .update({ 
      proof_url: publicUrl,
      status: 'pending'
    })
    .eq('id', winnerId)
    .eq('user_id', user.id)

  if (dbError) return { error: `Database update failed: ${dbError.message}` }

  revalidatePath('/dashboard/winnings')
  revalidatePath('/admin/winners')
  return { success: true }
}

/**
 * Admins only: Approve or reject a winner claim.
 */
export async function updateWinnerStatusAction(winnerId: string, status: 'approved' | 'rejected') {
  const supabase = await createAdminClient()
  
  const { error } = await supabase
    .from('winners')
    .update({ status })
    .eq('id', winnerId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/winners')
  revalidatePath('/dashboard/winnings')
  return { success: true }
}

/**
 * Admins only: Mark a winner as paid.
 */
export async function markAsPaidAction(winnerId: string) {
  const supabase = await createAdminClient()
  
  const { error } = await supabase
    .from('winners')
    .update({ status: 'paid' })
    .eq('id', winnerId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/winners')
  revalidatePath('/dashboard/winnings')
  return { success: true }
}
