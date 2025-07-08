'use client'

import { useState } from 'react'
import { 
  ConfettiEffect, 
  FloatingParticles, 
  RippleEffect, 
  ModernSuccessAnimation,
  MagicDust,
  PulseWave,
  MorphingButton,
  FloatingActionButton,
  FlipCard,
  MagicDust as MagicDustComponent
} from '../../components/AdvancedUX'
import { Heart, ShoppingCart, Star, Sparkles, Zap, Target, Award } from 'lucide-react'

export default function UXShowcasePage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showMagicDust, setShowMagicDust] = useState(false)
  const [showPulseWave, setShowPulseWave] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [activeButton, setActiveButton] = useState(false)

  const triggerAllEffects = () => {
    setShowConfetti(true)
    setShowParticles(true)
    setShowSuccess(true)
    setShowMagicDust(true)
    setShowPulseWave(true)

    setTimeout(() => setShowConfetti(false), 3000)
    setTimeout(() => setShowParticles(false), 2000)
    setTimeout(() => setShowSuccess(false), 1500)
    setTimeout(() => setShowMagicDust(false), 3000)
    setTimeout(() => setShowPulseWave(false), 2000)
  }

  return (
    <>
      {/* Advanced Effects */}
      <ConfettiEffect 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']}
      />
      <FloatingParticles 
        isActive={showParticles} 
        count={25}
        type="hearts"
      />
      <ModernSuccessAnimation isActive={showSuccess} />
      <MagicDust isActive={showMagicDust} />
      <PulseWave isActive={showPulseWave} />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
              ✨ Unreal UX Showcase ✨
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the most advanced micro-interactions, animations, and visual effects. 
              Every interaction is designed to delight and surprise!
            </p>
          </div>

          {/* Effect Triggers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Confetti Trigger */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Confetti Explosion</h3>
                <p className="text-gray-600 mb-4">Trigger a colorful confetti celebration!</p>
                <RippleEffect onClick={() => setShowConfetti(true)}>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-medium button-3d">
                    🎉 Launch Confetti
                  </button>
                </RippleEffect>
              </div>
            </div>

            {/* Particles Trigger */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold mb-2">Floating Particles</h3>
                <p className="text-gray-600 mb-4">Watch magical particles float across the screen!</p>
                <RippleEffect onClick={() => setShowParticles(true)}>
                  <button className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-3 rounded-lg font-medium button-3d">
                    ✨ Sparkle Magic
                  </button>
                </RippleEffect>
              </div>
            </div>

            {/* Success Animation */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-center">
                <Award className="h-12 w-12 text-green-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-semibold mb-2">Success Celebration</h3>
                <p className="text-gray-600 mb-4">Experience the joy of success!</p>
                <RippleEffect onClick={() => setShowSuccess(true)}>
                  <button className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-6 py-3 rounded-lg font-medium button-3d">
                    🎯 Success!
                  </button>
                </RippleEffect>
              </div>
            </div>

            {/* Magic Dust */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-center">
                <Star className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Magic Dust</h3>
                <p className="text-gray-600 mb-4">Sprinkle some magical dust!</p>
                <RippleEffect onClick={() => setShowMagicDust(true)}>
                  <button className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-3 rounded-lg font-medium button-3d">
                    ✨ Magic Dust
                  </button>
                </RippleEffect>
              </div>
            </div>

            {/* Pulse Wave */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-center">
                <Target className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse-glow" />
                <h3 className="text-xl font-semibold mb-2">Pulse Wave</h3>
                <p className="text-gray-600 mb-4">Feel the energy pulse through!</p>
                <RippleEffect onClick={() => setShowPulseWave(true)}>
                  <button className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-6 py-3 rounded-lg font-medium button-3d">
                    💫 Pulse Wave
                  </button>
                </RippleEffect>
              </div>
            </div>

            {/* All Effects */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="text-center">
                <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4 animate-float" />
                <h3 className="text-xl font-semibold mb-2">All Effects</h3>
                <p className="text-gray-600 mb-4">Experience everything at once!</p>
                <RippleEffect onClick={triggerAllEffects}>
                  <button className="bg-gradient-to-r from-pink-400 to-red-500 text-white px-6 py-3 rounded-lg font-medium button-3d holographic">
                    🌟 All Effects
                  </button>
                </RippleEffect>
              </div>
            </div>
          </div>

          {/* Advanced Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Morphing Button */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-center">Morphing Button</h3>
              <div className="flex justify-center">
                <MorphingButton
                  onClick={() => setActiveButton(!activeButton)}
                  isActive={activeButton}
                  className="px-8 py-4 rounded-xl text-white font-semibold text-lg"
                >
                  {activeButton ? '❤️ Active' : '💔 Inactive'}
                </MorphingButton>
              </div>
            </div>

            {/* Floating Action Button */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-center">Floating Action Button</h3>
              <div className="flex justify-center">
                <FloatingActionButton
                  onClick={() => console.log('Floating button clicked!')}
                  trail={true}
                >
                  <ShoppingCart size={24} />
                </FloatingActionButton>
              </div>
            </div>
          </div>

          {/* 3D Flip Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">3D Flip Card</h3>
            <div className="flex justify-center">
              <div className="w-64 h-48 perspective-1000">
                <FlipCard
                  front={
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      Front Side
                    </div>
                  }
                  back={
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      Back Side
                    </div>
                  }
                  isFlipped={isFlipped}
                />
              </div>
            </div>
            <div className="text-center mt-4">
              <RippleEffect onClick={() => setIsFlipped(!isFlipped)}>
                <button className="bg-gray-800 text-white px-6 py-2 rounded-lg button-3d">
                  Flip Card
                </button>
              </RippleEffect>
            </div>
          </div>

          {/* CSS Effects Showcase */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg hover-lift">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-4 animate-float"></div>
              <p className="font-semibold">Float</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg hover-lift">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-teal-500 rounded-full mx-auto mb-4 animate-pulse-glow"></div>
              <p className="font-semibold">Pulse Glow</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg hover-lift">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 animate-shimmer"></div>
              <p className="font-semibold">Shimmer</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-lg hover-lift">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mx-auto mb-4 animate-bounce-in"></div>
              <p className="font-semibold">Bounce In</p>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-8">Interactive Elements</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium button-3d">
                3D Button
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium morph-shape">
                Morph Shape
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium liquid">
                Liquid Effect
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium magnetic-pull">
                Magnetic Pull
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium quantum">
                Quantum Effect
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 