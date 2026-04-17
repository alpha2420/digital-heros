'use client'

import { useState } from 'react'
import { deleteScoreAction } from '@/lib/actions/scores'
import { ScoreForm } from './ScoreForm'
import { Trash2, Edit3, X, Calendar, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Score {
  id: string
  score: number
  played_date: string
}

export function ScoreList({ scores }: { scores: Score[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {scores.map((score) => (
          <motion.div
            key={score.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="group"
          >
            {editingId === score.id ? (
              <div className="relative">
                <button 
                  onClick={() => setEditingId(null)}
                  className="absolute -top-2 -right-2 p-1 bg-white/10 hover:bg-white/20 rounded-full z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <ScoreForm 
                  initialData={score} 
                  onSuccess={() => setEditingId(null)} 
                />
              </div>
            ) : (
              <div className="glass p-5 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" /> {new Date(score.played_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Trophy className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black">{score.score}</span>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Points</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                  <button 
                    onClick={() => setEditingId(score.id)}
                    className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this score?')) {
                        await deleteScoreAction(score.id)
                      }
                    }}
                    className="p-3 hover:bg-destructive/10 rounded-2xl text-gray-500 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {scores.length === 0 && (
        <div className="text-center py-16 glass rounded-[2rem] border border-dashed border-white/10">
          <p className="text-gray-500">No scores yet. Records of your impact and skill will appear here.</p>
        </div>
      )}
    </div>
  )
}
