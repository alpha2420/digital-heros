'use client'

import { useState } from 'react'
import { addScoreAction, updateScoreAction } from '@/lib/actions/scores'
import { Trophy, Calendar, AlertCircle, Loader2 } from 'lucide-react'

interface ScoreFormProps {
  initialData?: {
    id: string
    score: number
    played_date: string
  }
  onSuccess?: () => void
}

export function ScoreForm({ initialData, onSuccess }: ScoreFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = initialData 
      ? await updateScoreAction(initialData.id, formData)
      : await addScoreAction(formData)

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      if (!initialData) {
        // Clear form (standard way is using a key or ref, but for simple we can just rely on revalidatePath)
      }
      onSuccess?.()
    }
  }

  return (
    <form action={handleSubmit} className="glass p-6 rounded-3xl border border-white/5 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> Stableford Score
          </label>
          <input 
            name="score" 
            type="number" 
            min="1" 
            max="45" 
            required 
            defaultValue={initialData?.score || ''}
            placeholder="1-45"
            className="input-field" 
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Date Played
          </label>
          <input 
            name="playedDate" 
            type="date" 
            required 
            defaultValue={initialData?.played_date || new Date().toISOString().split('T')[0]}
            className="input-field" 
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {initialData ? 'Update Score' : 'Add New Score'}
      </button>

      {!initialData && (
        <p className="text-[10px] text-center text-gray-500 font-medium uppercase tracking-widest mt-2">
          Only the 5 most recent scores are kept
        </p>
      )}
    </form>
  )
}
