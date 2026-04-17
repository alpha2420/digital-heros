'use client'

import { useState } from 'react'
import { submitProofAction } from '@/lib/actions/winners'
import { Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export function ProofUpload({ winnerId }: { winnerId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await submitProofAction(winnerId, formData)
    
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">Proof submitted successfully! Awaiting review.</span>
      </div>
    )
  }

  return (
    <form action={handleUpload} className="space-y-4">
      <div className="relative group">
        <input 
          type="file" 
          name="file" 
          accept="image/*" 
          required 
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
        />
        <div className="glass p-8 rounded-[2rem] border border-white/5 group-hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
            Tap to upload score screenshot
          </p>
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest text-center max-w-[160px]">
            Please ensure date and scores are clearly visible
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Submit'}
      </button>
    </form>
  )
}
