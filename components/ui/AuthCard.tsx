'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function AuthCard({ children, title, description }: { children: ReactNode, title: string, description?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md glass p-8 rounded-3xl"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && <p className="text-gray-400">{description}</p>}
      </div>
      {children}
    </motion.div>
  )
}
