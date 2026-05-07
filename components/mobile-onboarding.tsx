"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function MobileOnboarding() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const minSwipeDistance = 50

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === slides.length - 1 ? 0 : prev + 1))
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? slides.length - 1 : prev - 1))
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) goToNext()
    if (isRightSwipe) goToPrevious()
  }

  // Auto-scroll functionality with pause on interaction
  useEffect(() => {
    if (isPaused) return
    
    const interval = setInterval(() => {
      goToNext()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isPaused, goToNext])

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      title: "Safety First",
      description: "We verify every user to keep you safe.",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      title: "Smart Matching",
      description: "Advanced algorithm ensures meaningful connections.",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
      title: "Real Connections",
      description: "Find genuine people looking for real relationships.",
    },
  ]


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Mobile Frame */}
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-gray-200">
        {/* Logo */}
        <div className="absolute top-6 right-6 z-30">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="backdrop-blur-sm bg-white/30 p-1.5 "
          >
            <Image
              src="/logo1.png"
              alt="Logo"
              width={65}
              height={65}
              className=" mix-blend-multiply"
              priority
            />
          </motion.div>
        </div>
        
        {/* Main Content */}
        <div 
          ref={carouselRef}
          className="relative overflow-hidden select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-roledescription="carousel"
          aria-label="Onboarding slides"
        >
          {/* Image Carousel */}
          <div className="relative h-[500px] bg-white overflow-hidden flex items-center justify-center">
            {/* Preview of Previous Image */}
            <motion.div 
              className="absolute left-4 w-32 h-64 rounded-xl overflow-hidden z-10 opacity-70"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 0.7 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={slides[currentIndex === 0 ? slides.length - 1 : currentIndex - 1].image}
                alt="Previous slide preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100px, 150px"
              />
            </motion.div>

            {/* Center Main Image */}
            <motion.div 
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-64 h-80 rounded-3xl overflow-hidden shadow-2xl mx-auto z-20"
            >
              <Image
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>

            {/* Preview of Next Image */}
            <motion.div 
              className="absolute right-4 w-32 h-64 rounded-xl overflow-hidden z-10 opacity-70"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 0.7 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={slides[currentIndex === slides.length - 1 ? 0 : currentIndex + 1].image}
                alt="Next slide preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100px, 150px"
              />
            </motion.div>


            {/* Swipe indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1">
              {slides.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-4 bg-rose-500' : 'w-2 bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8 text-center">
            {/* Title */}
            <h2 className="text-3xl font-bold text-[#e83f55] mb-3 tracking-tight">{slides[currentIndex].title}</h2>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-8">{slides[currentIndex].description}</p>

            {/* CTA Button */}
            <button 
              onClick={() => router.push('/signup')}
              className="w-full bg-[#e83f55] hover:bg-[#d62a3f] text-white font-semibold py-3.5 px-6 rounded-lg transition-colors mb-4 shadow-md"
            >
              Create an account
            </button>

            {/* Sign In Link */}
            <p className="text-gray-700 text-sm">
              Already have an account?{" "}
              <button 
                onClick={() => router.push('/login')}
                className="text-[#e83f55] hover:text-[#e83f55] font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

    
      </div>
    </div>
  )
}
