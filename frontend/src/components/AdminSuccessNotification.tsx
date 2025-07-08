'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X } from 'lucide-react'

interface AdminSuccessNotificationProps {
  isVisible: boolean
  message: string
  onClose: () => void
  type?: 'success' | 'error' | 'info'
}

export default function AdminSuccessNotification({ 
  isVisible, 
  message, 
  onClose,
  type = 'success'
}: AdminSuccessNotificationProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, color: string}>>([])

  useEffect(() => {
    if (isVisible) {
      // Generate particles
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)]
      }))
      setParticles(newParticles)

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <X className="w-6 h-6 text-red-400" />
      case 'info':
        return <CheckCircle className="w-6 h-6 text-blue-400" />
      default:
        return <CheckCircle className="w-6 h-6 text-green-400" />
    }
  }

  const getGradient = () => {
    switch (type) {
      case 'error':
        return 'from-red-400 via-red-500 to-red-600'
      case 'info':
        return 'from-blue-400 via-blue-500 to-blue-600'
      default:
        return 'from-green-400 via-green-500 to-green-600'
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        {/* Main Notification */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: [0, 5, -5, 0] }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`
            relative overflow-hidden rounded-xl shadow-2xl border border-white/20
            bg-gradient-to-r ${getGradient()}
            backdrop-blur-lg
            min-w-[320px]
          `}
        >
          {/* Animated Background */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />

          {/* Content */}
          <div className="relative p-4 text-white">
            <div className="flex items-center space-x-3">
              {/* Icon with pulse effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="flex-shrink-0"
              >
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                  {getIcon()}
                </div>
              </motion.div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-sm font-semibold mb-1"
                >
                  {type === 'error' ? 'Error!' : type === 'info' ? 'Info' : 'Success!'}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-xs opacity-90"
                >
                  {message}
                </motion.p>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0, 
                  x: particle.x, 
                  y: particle.y 
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: particle.x + (Math.random() - 0.5) * 50,
                  y: particle.y - 50,
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 1,
                  delay: Math.random() * 0.3,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: particle.color }}
                />
              </motion.div>
            ))}
          </div>

          {/* Shimmer Effect */}
          <motion.div
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 