'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import Lottie from 'lottie-react'
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react'

// Lottie animation data (simplified heart beat animation)
const heartBeatAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Heart Beat",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Heart",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 15, s: [120, 120, 100] },
            { t: 30, s: [100, 100, 100] },
            { t: 45, s: [110, 110, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      }
    }
  ]
}

// Confetti Component
export const ConfettiEffect = ({ 
  isActive, 
  onComplete, 
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'] 
}: {
  isActive: boolean
  onComplete?: () => void
  colors?: string[]
}) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
    return () => window.removeEventListener('resize', updateWindowSize)
  }, [])

  if (!isActive) return null

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={200}
      colors={colors}
      onConfettiComplete={onComplete}
      gravity={0.3}
      wind={0.05}
    />
  )
}

// Floating Particles Component
export const FloatingParticles = ({ 
  isActive, 
  count = 20,
  type = 'hearts' 
}: {
  isActive: boolean
  count?: number
  type?: 'hearts' | 'stars' | 'sparkles'
}) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3
  }))

  const getIcon = () => {
    switch (type) {
      case 'hearts': return <Heart size={12} className="text-red-400" />
      case 'stars': return <Star size={12} className="text-yellow-400" />
      case 'sparkles': return <Sparkles size={12} className="text-blue-400" />
      default: return <Heart size={12} className="text-red-400" />
    }
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [-20, -100, -200],
            rotate: [0, 360]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut"
          }}
        >
          {getIcon()}
        </motion.div>
      ))}
    </div>
  )
}

// Ripple Effect Component
export const RippleEffect = ({ children, onClick }: { 
  children: React.ReactNode
  onClick?: (e?: React.MouseEvent) => void 
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 1000)

    onClick?.(e)
  }

  return (
    <div
      ref={buttonRef}
      className="relative overflow-hidden"
      onClick={handleClick}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

// Morphing Button Component
export const MorphingButton = ({ 
  children, 
  onClick, 
  isActive = false,
  className = ""
}: {
  children: React.ReactNode
  onClick: () => void
  isActive?: boolean
  className?: string
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={isActive ? { 
        boxShadow: "0 0 20px rgba(255, 107, 107, 0.5)",
        background: "linear-gradient(45deg, #ff6b6b, #ff8e8e)"
      } : {}}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400"
        initial={{ scale: 0, opacity: 0 }}
        animate={isActive ? { scale: 1, opacity: 0.1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.button>
  )
}

// Success Animation Component (Legacy - for backward compatibility)
export const SuccessAnimation = ({ isActive }: { isActive: boolean }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-green-500 text-white p-6 rounded-full shadow-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ✓
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Modern Success Animation with Green Tick and Color Shower
export function ModernSuccessAnimation({ isActive, message }: { isActive: boolean; message?: string }) {
  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />
      
      {/* Success Container */}
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform scale-0 animate-bounce-in">
        {/* Green Tick Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse-glow">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Message */}
        {message && (
          <p className="text-center text-gray-800 font-semibold text-lg animate-fade-in-up">
            {message}
          </p>
        )}
        
        {/* Color Shower Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Floating Action Button with Particle Trail
export const FloatingActionButton = ({ 
  children, 
  onClick,
  trail = true
}: {
  children: React.ReactNode
  onClick: () => void
  trail?: boolean
}) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = () => {
    if (trail) {
      // Add particle trail
      const newParticles = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }))
      setParticles(prev => [...prev, ...newParticles])

      // Remove particles after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)))
      }, 2000)
    }
    onClick()
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        className="relative z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl"
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 20px 40px rgba(255, 107, 107, 0.4)"
        }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0]
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        {children}
      </motion.button>

      {/* Particle Trail */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: 0,
            scale: 0,
            y: -50,
            x: Math.random() * 100 - 50
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

// 3D Card Flip Component
export const FlipCard = ({ 
  front, 
  back, 
  isFlipped = false 
}: {
  front: React.ReactNode
  back: React.ReactNode
  isFlipped?: boolean
}) => {
  return (
    <div className="relative w-full h-full perspective-1000">
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 backface-hidden">
          {front}
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          {back}
        </div>
      </motion.div>
    </div>
  )
}

// Magic Dust Effect
export const MagicDust = ({ isActive }: { isActive: boolean }) => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    size: Math.random() * 4 + 2
  }))

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: [0, -100, -200],
            x: [0, Math.random() * 50 - 25, Math.random() * 100 - 50]
          }}
          transition={{
            duration: 3,
            delay: particle.delay,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

// Pulse Wave Component
export const PulseWave = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center"
          animate={{
            scale: [1, 1.5, 2, 2.5],
            opacity: [1, 0.8, 0.6, 0]
          }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
            animate={{
              scale: [0, 1, 1.2, 1]
            }}
            transition={{
              duration: 0.5,
              delay: 0.2
            }}
          >
            <motion.div
              className="text-green-600 text-2xl"
              animate={{
                scale: [0, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{
                duration: 0.6,
                delay: 0.4
              }}
            >
              ✓
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Success Wave Effect Component
export const SuccessWaveEffect = ({ isActive, message }: { isActive: boolean; message?: string }) => {
  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Multiple expanding circles */}
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 2, 3, 4],
            opacity: [1, 0.8, 0.6, 0.4, 0]
          }}
          transition={{
            duration: 2,
            delay: index * 0.2,
            ease: "easeOut"
          }}
        >
          <div className="w-20 h-20 rounded-full border-4 border-green-400" />
        </motion.div>
      ))}
      
      {/* Success message */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center">
          <motion.div
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 0.6,
              delay: 0.8
            }}
          >
            <motion.div
              className="text-white text-2xl font-bold"
              animate={{
                scale: [0, 1.2, 1]
              }}
              transition={{
                duration: 0.4,
                delay: 1.2
              }}
            >
              ✓
            </motion.div>
          </motion.div>
          <motion.h3
            className="text-lg font-semibold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            Success!
          </motion.h3>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            {message || 'Action completed successfully!'}
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
} 