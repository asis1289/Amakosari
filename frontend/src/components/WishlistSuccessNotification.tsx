'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Sparkles, CheckCircle } from 'lucide-react'

interface SuccessNotificationProps {
  isVisible: boolean
  type: 'cart' | 'wishlist'
  message: string
  onClose: () => void
}

export default function WishlistSuccessNotification({ 
  isVisible, 
  type, 
  message, 
  onClose 
}: SuccessNotificationProps) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, color: string}>>([])

  useEffect(() => {
    if (isVisible) {
      // Generate particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ff8b94'][Math.floor(Math.random() * 8)]
      }))
      setParticles(newParticles)

      // Auto close after 1.2 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 1200)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getIcon = () => {
    // Always show spinning tick for all actions
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="inline-block"
      >
        <CheckCircle className="w-8 h-8 text-green-400" />
      </motion.div>
    )
  }

  const getGradient = () => {
    // Always use green gradient
    return 'from-green-400 via-green-500 to-green-600'
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed left-1/2 top-1/3 z-50 -translate-x-1/2"
        style={{ pointerEvents: 'none' }} // Prevents blocking UI
      >
        {/* Large spinning tick/circle behind the box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.45, scale: 1, rotate: 360 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 2.5, ease: 'linear', repeat: Infinity, repeatType: 'loop', repeatDelay: 0 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ width: 240, height: 240 }}
        >
          <div className="w-full h-full relative">
            {/* Multiple layered circles with different colors from ProductCard hover effects */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-blue-500 opacity-30"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
              className="absolute inset-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-40"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, ease: 'linear', repeat: Infinity }}
              className="absolute inset-4 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 opacity-50"
            />
            {/* Center tick icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>
        </motion.div>
        {/* Main Notification */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: [0, 10, -10, 0] }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`
            relative overflow-hidden rounded-2xl shadow-2xl border border-white/20
            bg-gradient-to-r ${getGradient()}
            backdrop-blur-lg
            min-w-[320px] max-w-[400px]
            z-10
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
          <div className="relative p-6 text-white">
            <div className="flex items-center space-x-4">
              {/* Icon with pulse effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="flex-shrink-0"
              >
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                  {getIcon()}
                </div>
              </motion.div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-lg font-bold mb-1"
                >
                  Success!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-sm opacity-90"
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                  x: particle.x + (Math.random() - 0.5) * 100,
                  y: particle.y - 100,
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <Sparkles 
                  size={12} 
                  className="text-white/80"
                  style={{ color: particle.color }}
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

        {/* Success Wave */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5], opacity: [1, 0] }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute inset-0 rounded-2xl border-2 border-white/30"
        />
      </motion.div>
    </AnimatePresence>
  )
} 