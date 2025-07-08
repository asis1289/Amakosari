'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Upload, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Key,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Monitor,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface HeroBackground {
  id: string
  imageUrl: string | null
  isActive: boolean
  isDefault: boolean
  overlayOpacity: number
}

interface PasswordStrength {
  score: number
  feedback: string[]
  suggestions: string[]
}

// Hero Image 3D Effect Component (same as homepage)
function HeroImage3DEffect({ imageUrl }: { imageUrl: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    let tiltX = 0, tiltY = 0, zoom = 1
    const handleMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect()
      const x = (e.clientX - left) / width - 0.5
      const y = (e.clientY - top) / height - 0.5
      tiltX = -y * 10
      tiltY = x * 10
      zoom = 1.04
      el.style.transform = `scale(${zoom}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    }
    const handleLeave = () => {
      tiltX = 0
      tiltY = 0
      zoom = 1
      el.style.transform = ''
    }
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-0 transition-transform duration-700 ease-out"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    />
  )
}

// Live Hero Preview Component
function LiveHeroPreview({ heroBackground, overlayOpacity, isDefault }: { 
  heroBackground: HeroBackground | null
  overlayOpacity: number
  isDefault: boolean 
}) {
  return (
    <section
      className={`relative overflow-hidden text-white min-h-[400px] flex items-center justify-center transition-all duration-700 ${
        heroBackground?.imageUrl && !isDefault
          ? 'hero-image-mode'
          : 'animated-gradient-bg'
      }`}
      style={
        heroBackground?.imageUrl && !isDefault
          ? {
              background: 'none',
            }
          : {}
      }
    >
      {/* 1. Uploaded image as 3D/parallax background (image mode) */}
      {heroBackground?.imageUrl && !isDefault && (
        <HeroImage3DEffect imageUrl={heroBackground.imageUrl} />
      )}
      
      {/* 2. Animated Gradient Overlay (default mode) */}
      {(!heroBackground?.imageUrl || isDefault) && (
        <div className="absolute inset-0 z-0 animated-gradient-bg pointer-events-none" aria-hidden="true"></div>
      )}
      
      {/* Glassmorphism Card and Content with Morph Transitions */}
      <div
        className={`relative z-10 max-w-2xl mx-auto px-8 py-12 rounded-3xl backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl glass-card transition-all duration-700 ease-out ${
          heroBackground?.imageUrl && !isDefault 
            ? 'hero-content-image-mode' 
            : 'hero-content-default-mode'
        }`}
        style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)',
          backdropFilter: 'blur(18px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
          borderRadius: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shine effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
          background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%)',
          opacity: 0.7,
          borderRadius: '2rem',
          zIndex: 1
        }} />
        <div className="relative z-10 text-center">
          <h1 
            className={`font-extrabold tracking-tight mb-4 drop-shadow-lg transition-all duration-700 ${
              heroBackground?.imageUrl && !isDefault
                ? 'text-3xl md:text-4xl'
                : 'text-4xl md:text-5xl'
            }`}
          >
            <span className="inline-block text-white/90">आमाको</span>
            <span className="inline-block text-orange-400 ml-2">Saaरी</span>
          </h1>
          <p 
            className={`font-medium text-white/80 mb-8 transition-all duration-700 ${
              heroBackground?.imageUrl && !isDefault
                ? 'text-base md:text-lg'
                : 'text-lg md:text-xl'
            }`}
          >
            Discover authentic Nepali saaris and cultural dresses. Handcrafted for every woman, every occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700">
            <Link href="/products" className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 text-sm">
              Shop Now
            </Link>
            <Link href="/about" className="bg-white/80 hover:bg-white/90 text-orange-700 px-6 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 backdrop-blur-md text-sm">
              Learn More
            </Link>
          </div>
        </div>
      </div>
      
      {/* Subtle zoom/shine overlay for image mode */}
      {heroBackground?.imageUrl && !isDefault && (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          background: 'linear-gradient(120deg, rgba(255,94,0,0.18) 0%, rgba(255,0,128,0.10) 100%)',
          mixBlendMode: 'screen',
          filter: 'blur(2px) brightness(1.08) saturate(1.1)',
          transition: 'all 0.7s cubic-bezier(.4,2,.3,1)',
        }} />
      )}
    </section>
  )
}

export default function AdminSettings() {
  // Hero Background State
  const [heroBackground, setHeroBackground] = useState<HeroBackground | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [overlayOpacity, setOverlayOpacity] = useState(0.2)
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  // Access Key Change State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newAccessKey, setNewAccessKey] = useState('')
  const [confirmAccessKey, setConfirmAccessKey] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewAccessKey, setShowNewAccessKey] = useState(false)
  const [showConfirmAccessKey, setShowConfirmAccessKey] = useState(false)
  const [accessKeyLoading, setAccessKeyLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    suggestions: []
  })

  // Toast Notifications
  const [toasts, setToasts] = useState<Toast[]>([])

  // General Loading State
  const [generalLoading, setGeneralLoading] = useState(false)

  // Add state for drag-and-drop and error
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    fetchHeroBackground()
  }, [])

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = []
    const suggestions: string[] = []
    let score = 0

    // Length check
    if (password.length < 8) {
      feedback.push('At least 8 characters required')
    } else {
      score += 1
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      feedback.push('Include at least one uppercase letter')
    } else {
      score += 1
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      feedback.push('Include at least one lowercase letter')
    } else {
      score += 1
    }

    // Number check
    if (!/\d/.test(password)) {
      feedback.push('Include at least one number')
    } else {
      score += 1
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      feedback.push('Include at least one special character')
    } else {
      score += 1
    }

    // Additional strength checks
    if (password.length >= 12) {
      score += 1
    }
    if (password.length >= 16) {
      score += 1
    }

    // Generate suggestions
    if (score < 3) {
      suggestions.push('Try mixing uppercase, lowercase, numbers, and symbols')
    }
    if (password.length < 12) {
      suggestions.push('Consider using a longer password (12+ characters)')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      suggestions.push('Add special characters like !@#$%^&*')
    }

    return { score, feedback, suggestions }
  }

  // Update password strength when new access key changes
  useEffect(() => {
    if (newAccessKey) {
      setPasswordStrength(checkPasswordStrength(newAccessKey))
    } else {
      setPasswordStrength({ score: 0, feedback: [], suggestions: [] })
    }
  }, [newAccessKey])

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }

  const fetchHeroBackground = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/hero-background', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setHeroBackground(data.heroBackground)
        if (data.heroBackground) {
          setOverlayOpacity(data.heroBackground.overlayOpacity)
          setIsDefault(data.heroBackground.isDefault)
        }
      }
    } catch (error) {
      console.error('Error fetching hero background:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed!')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setIsDefault(false)
    }
  }

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      
      if (selectedFile) {
        formData.append('image', selectedFile)
      }
      
      formData.append('overlayOpacity', overlayOpacity.toString())
      formData.append('isDefault', isDefault.toString())
      
      const response = await fetch('/api/admin/hero-background', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        addToast('success', 'Hero background updated successfully!')
        await fetchHeroBackground()
        setSelectedFile(null)
        setPreviewUrl(null)
      } else {
        const data = await response.json()
        addToast('error', data.error || 'Failed to update hero background')
      }
    } catch (error) {
      console.error('Error updating hero background:', error)
      addToast('error', 'Failed to update hero background')
    } finally {
      setLoading(false)
    }
  }

  const handleHeroReset = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/hero-background/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        addToast('success', 'Hero background reset to default!')
        await fetchHeroBackground()
        setSelectedFile(null)
        setPreviewUrl(null)
        setIsDefault(true)
        setOverlayOpacity(0.2)
      } else {
        const data = await response.json()
        addToast('error', data.error || 'Failed to reset hero background')
      }
    } catch (error) {
      console.error('Error resetting hero background:', error)
      addToast('error', 'Failed to reset hero background')
    }
  }

  const generateStrongAccessKey = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    let password = ''
    
    // Ensure at least one of each required character type
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]
    
    // Fill the rest with random characters
    const allChars = uppercase + lowercase + numbers + symbols
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('')
    
    setNewAccessKey(password)
    setConfirmAccessKey(password)
  }

  const handleAccessKeyChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword.trim()) {
      addToast('error', 'Current password is required')
      return
    }
    
    if (!newAccessKey.trim()) {
      addToast('error', 'New access key is required')
      return
    }
    
    if (newAccessKey !== confirmAccessKey) {
      addToast('error', 'Access keys do not match')
      return
    }
    
    if (passwordStrength.score < 4) {
      addToast('error', 'Access key does not meet security requirements')
      return
    }
    
    setAccessKeyLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/access-key', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newAccessKey
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addToast('success', 'Access key updated successfully!')
        setCurrentPassword('')
        setNewAccessKey('')
        setConfirmAccessKey('')
        setPasswordStrength({ score: 0, feedback: [], suggestions: [] })
      } else {
        addToast('error', data.error || 'Failed to update access key')
      }
    } catch (error) {
      console.error('Error updating access key:', error)
      addToast('error', 'Failed to update access key')
    } finally {
      setAccessKeyLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'text-red-500'
    if (score <= 3) return 'text-orange-500'
    if (score <= 4) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Very Weak'
    if (score <= 3) return 'Weak'
    if (score <= 4) return 'Fair'
    if (score <= 5) return 'Good'
    return 'Strong'
  }

  // Create a preview hero background object for the live preview
  const previewHeroBackground: HeroBackground | null = heroBackground ? {
    ...heroBackground,
    imageUrl: previewUrl || heroBackground.imageUrl,
    overlayOpacity: overlayOpacity,
    isDefault: isDefault
  } : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Admin Settings
          </h1>
          <p className="text-gray-600">Manage your website settings and configurations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Hero Background Management */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Hero Background Management
              </h2>
              <p className="text-gray-600 mb-6">Customize the hero section background image and overlay settings</p>

              {/* Live Preview Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded-lg transition-colors ${
                        previewMode === 'desktop' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded-lg transition-colors ${
                        previewMode === 'mobile' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Live Preview Container */}
                <div className={`relative rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                }`}>
                  <LiveHeroPreview 
                    heroBackground={previewHeroBackground}
                    overlayOpacity={overlayOpacity}
                    isDefault={isDefault}
                  />
                </div>
              </div>

              {/* Upload New Background */}
              <form onSubmit={handleHeroSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Background Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      type="button"
                      onClick={handleHeroReset}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                  {uploadError && (
                    <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                  )}
                </div>

                {/* Overlay Opacity Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overlay Opacity: {Math.round(overlayOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Default Background Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                    Use default gradient background
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Hero Background</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Access Key Change */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Change Admin Access Key
              </h2>
              <p className="text-gray-600 mb-6">Update the access key required for admin registration with enhanced security</p>

              <form onSubmit={handleAccessKeyChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Access Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showNewAccessKey ? "text" : "password"}
                      value={newAccessKey}
                      onChange={(e) => setNewAccessKey(e.target.value)}
                      placeholder="Enter new access key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewAccessKey(!showNewAccessKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewAccessKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {newAccessKey && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Strength:</span>
                        <span className={`text-sm font-semibold ${getStrengthColor(passwordStrength.score)}`}>
                          {getStrengthText(passwordStrength.score)}
                        </span>
                      </div>
                      
                      {/* Strength Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 2 ? 'bg-red-500' :
                            passwordStrength.score <= 3 ? 'bg-orange-500' :
                            passwordStrength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                        ></div>
                      </div>

                      {/* Requirements */}
                      <div className="space-y-1">
                        {[
                          { label: 'At least 8 characters', met: newAccessKey.length >= 8 },
                          { label: 'Uppercase letter', met: /[A-Z]/.test(newAccessKey) },
                          { label: 'Lowercase letter', met: /[a-z]/.test(newAccessKey) },
                          { label: 'Number', met: /\d/.test(newAccessKey) },
                          { label: 'Special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newAccessKey) }
                        ].map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            {req.met ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={req.met ? 'text-green-700' : 'text-red-700'}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Suggestions */}
                      {passwordStrength.suggestions.length > 0 && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800 mb-1">Suggestions:</p>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {passwordStrength.suggestions.map((suggestion, index) => (
                                  <li key={index}>• {suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm New Access Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmAccessKey ? "text" : "password"}
                      value={confirmAccessKey}
                      onChange={(e) => setConfirmAccessKey(e.target.value)}
                      placeholder="Confirm new access key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmAccessKey(!showConfirmAccessKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmAccessKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmAccessKey && newAccessKey !== confirmAccessKey && (
                    <p className="text-red-500 text-sm mt-1">Access keys do not match</p>
                  )}
                </div>

                {/* Generate Strong Access Key Button */}
                <div>
                  <button
                    type="button"
                    onClick={generateStrongAccessKey}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Generate Strong Access Key
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={accessKeyLoading || !currentPassword || !newAccessKey || !confirmAccessKey || newAccessKey !== confirmAccessKey || passwordStrength.score < 4}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {accessKeyLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <><Shield className="h-4 w-4" /> Update Access Key</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .animated-gradient-bg {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .glass-card {
          backdrop-filter: blur(18px) saturate(1.2);
          -webkit-backdrop-filter: blur(18px) saturate(1.2);
        }
      `}</style>
    </div>
  )
}