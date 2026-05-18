"use client"

import { useState, useRef, useCallback, CSSProperties } from "react"
import { ChevronLeft, Settings2, X, Heart, Star, MessageCircle, Users, MapPin, Compass, MessageSquareHeart, Merge, } from "lucide-react"
import { SiDiscover } from "react-icons/si";

import PageHeader from "@/components/PageHeader"
import BottomNavigation from "@/components/BottomNavigation"

type Card = {
  id: number
  name: string
  age: number
  location: string
  distance: string
  profession: string
  image: string
  liked?: boolean
}

type Position = {
  x: number
  y: number
  rotation: number
}

type FilterOptions = {
  ageRange: [number, number];
  maxDistance: number;
  gender: string[];
  interests: string[];
  showVerified: boolean;
};

export default function DiscoverPage() {
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 35],
    maxDistance: 50,
    gender: [],
    interests: [],
    showVerified: false,
  });
  const [cards, setCards] = useState<Card[]>([
    {
      id: 1,
      name: "Camila Snow",
      age: 23,
      location: "Chicago, IL",
      distance: "1 km",
      profession: "Marketer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    },
    {
      id: 9,
      name: "Sarah Johnson",
      age: 24,
      location: "Chicago, IL",
      distance: "2 km",
      profession: "Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    },
    {
      id: 10,
      name: "Sarah Johnson",
      age: 24,
      location: "Chicago, IL",
      distance: "2 km",
      profession: "Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    }, {
      id: 11,
      name: "Sarah Johnson",
      age: 24,
      location: "Chicago, IL",
      distance: "2 km",
      profession: "Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    }, {
      id: 2,
      name: "Sarah Johnson",
      age: 24,
      location: "Chicago, IL",
      distance: "2 km",
      profession: "Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    },
    {
      id: 3,
      name: "Emma Wilson",
      age: 25,
      location: "Chicago, IL",
      distance: "3 km",
      profession: "Artist",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    },
    {
      id: 4,
      name: "Alex Morgan",
      age: 26,
      location: "Chicago, IL",
      distance: "1.5 km",
      profession: "Developer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    },
  ])

  const [positions, setPositions] = useState<Position[]>(() =>
    Array(4).fill({ x: 0, y: 0, rotation: 0 })
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    // Mark the card as liked if swiped right
    if (direction === 'right') {
      setCards(prev => {
        const newCards = [...prev]
        newCards[currentIndex] = { ...newCards[currentIndex], liked: true }
        return newCards
      })
    }

    // Move to next card
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % cards.length)
      setPositions(prev => {
        const newPositions = [...prev]
        newPositions[currentIndex] = { x: 0, y: 0, rotation: 0 }
        return newPositions
      })
    }, 200)
  }, [currentIndex, cards.length])

  const handleStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, index: number) => {
    if (index !== currentIndex) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setStartPos({ x: clientX, y: clientY })
    setIsDragging(true)
  }, [currentIndex])

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const deltaX = clientX - startPos.x
    const rotation = Math.min(Math.max(deltaX * 0.1, -30), 30)

    setPositions(prev => {
      const newPositions = [...prev]
      newPositions[currentIndex] = {
        x: deltaX,
        y: Math.abs(deltaX) * 0.03,
        rotation
      }
      return newPositions
    })
  }, [isDragging, startPos, currentIndex])

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const currentPos = positions[currentIndex]?.x || 0
    const threshold = 100

    if (Math.abs(currentPos) > threshold) {
      const direction = currentPos > 0 ? 'right' : 'left'
      handleSwipe(direction)
    } else {
      // Return to center
      setPositions(prev => {
        const newPositions = [...prev]
        newPositions[currentIndex] = { x: 0, y: 0, rotation: 0 }
        return newPositions
      })
    }
  }, [isDragging, positions, currentIndex, handleSwipe])

  // Calculate styles for each card in the stack
  const getCardStyle = (index: number): CSSProperties => {
    if (index < currentIndex) return { display: 'none' }

    const position = positions[index] || { x: 0, y: 0, rotation: 0 }
    const isActive = index === currentIndex
    const isNextCard = index === currentIndex + 1
    const isThirdCard = index === currentIndex + 2
    const isFourthCard = index === currentIndex + 3

    // Calculate scale, position and shadow based on card position in stack
    let scale = 1
    let y = 0
    let opacity = 1
    let shadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)'

    if (isActive) {
      scale = 0.9
      y = 0
      opacity = 1
      shadow = '0 10px 25px -5px rgba(0, 0, 0, 0.25)'
    } else if (isNextCard) {
      scale = 0.85
      y = 25
      opacity = 0.9
      shadow = '0 10px 20px -5px rgba(0, 0, 0, 0.2)'
    } else if (isThirdCard) {
      scale = 0.8
      y = 50
      opacity = 0.8
      shadow = '0 8px 15px -5px rgba(0, 0, 0, 0.15)'
    } else if (isFourthCard) {
      scale = 0.75
      y = 75
      opacity = 0.7
      shadow = '0 5px 10px -5px rgba(0, 0, 0, 0.1)'
    } else {
      scale = 0.7
      y = 100
      opacity = 0.6
      shadow = '0 3px 8px -3px rgba(0, 0, 0, 0.08)'
    }

    // Only apply drag transformation to the active card
    const xTransform = isActive ? position.x : 0
    const rotation = isActive ? position.rotation : 0
    const yTransform = isActive ? position.y : 0

    return {
      transform: `translate(${xTransform}px, ${y + yTransform}px) rotate(${rotation}deg) scale(${scale})`,
      zIndex: cards.length - index,
      opacity: opacity,
      boxShadow: shadow,
      transition: isDragging && isActive ? 'none' : 'all 0.3s cubic-bezier(0.2, 0.8, 0.3, 1.1)',
      cursor: isActive ? (isDragging ? 'grabbing' : 'grab') : 'default',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 'auto',
      touchAction: isActive ? 'none' : 'auto',
      width: 'calc(100% - 64px)',
      maxWidth: '350px',
      height: '65vh',
      maxHeight: '500px',
      willChange: 'transform, opacity, box-shadow',
      borderRadius: '16px',
      overflow: 'hidden',
      transformStyle: 'preserve-3d',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      WebkitTransformStyle: 'preserve-3d'
    }
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* Header */}
      <PageHeader
        title="Discover"
        subtitle="Swipe left to pass • Swipe right to like"
        showBackButton={false}
        showSettingsButton={true}
        onSettings={() => setShowFilters(true)}
      />

      {/* Card Stack Container */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-6 overflow-visible">
        <style jsx global>{`
          .card-stack-container {
            perspective: 1000px;
            width: 100%;
            max-width: 350px;
            height: 75vh;
            max-height: 650px;
            padding-top: 40px;
            position: relative;
            margin: 0 auto;
          }
          
          @media (max-width: 640px) {
            .card-stack-container {
              width: 100%;
              padding: 0 16px;
            }
          }
        `}</style>
        {cards.map((card: Card, index: number) => {
          if (index > currentIndex + 3) return null;

          return (
            <div
              key={`card-${card.id}`}
              ref={el => {
                if (el) cardRefs.current[index] = el;
              }}
              className="w-full h-full bg-white overflow-hidden border border-gray-200 transition-all duration-300 ease-out shadow-lg"
              style={{
                ...getCardStyle(index),
                '--i': index - currentIndex,
              } as React.CSSProperties}
              onMouseDown={(e) => handleStart(e, index)}
              onTouchStart={(e) => handleStart(e, index)}
            >
              <div className="relative w-full h-full">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/400x600'
                  }}
                />

                {/* Location Badge - Top Left */}
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <span>{card.location}</span>
                </div>

                {/* User Name - Bottom Left */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-xl font-bold">{card.name}</h3>
                </div>
              </div>
              {/* Like/Dislike indicators */}
              {index === currentIndex && (
                <>
                  <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 transform transition-all duration-200 ${(positions[index]?.x || 0) > 50 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      }`}
                    style={{
                      zIndex: 1000,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <Heart className="w-12 h-12 text-green-500" fill="currentColor" />
                  </div>
                  <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 transform transition-all duration-200 ${(positions[index]?.x || 0) < -50 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      }`}
                    style={{
                      zIndex: 1000,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    <X className="w-12 h-12 text-red-500" strokeWidth={3} />
                  </div>
                </>
              )}
            </div>
          );
        })}

        {currentIndex >= cards.length && (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">No more cards</h2>
            <p className="text-muted-foreground">Check back later for more profiles</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Age Range */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Age Range</label>
                  <span className="text-gray-500">{filters.ageRange[0]} - {filters.ageRange[1]}</span>
                </div>
                <div className="px-2">
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={filters.ageRange[0]}
                    onChange={(e) => setFilters({ ...filters, ageRange: [parseInt(e.target.value), filters.ageRange[1]] })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={filters.ageRange[1]}
                    onChange={(e) => setFilters({ ...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)] })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-4"
                  />
                </div>
              </div>

              {/* Distance */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Maximum Distance</label>
                  <span className="text-gray-500">Up to {filters.maxDistance} km</span>
                </div>
                <div className="px-2">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block font-medium mb-2">Show Me</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Men', 'Women', 'Everyone'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => {
                        if (gender === 'Everyone') {
                          setFilters({ ...filters, gender: [] });
                        } else {
                          setFilters({
                            ...filters,
                            gender: filters.gender.includes(gender)
                              ? filters.gender.filter(g => g !== gender)
                              : [...filters.gender, gender]
                          });
                        }
                      }}
                      className={`py-2 px-4 rounded-lg border ${(gender === 'Everyone' && filters.gender.length === 0) ||
                        filters.gender.includes(gender)
                        ? 'bg-rose-100 border-rose-300 text-rose-700'
                        : 'bg-white border-gray-200'
                        }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block font-medium mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {['Travel', 'Music', 'Sports', 'Food', 'Art', 'Gaming', 'Fitness', 'Reading'].map((interest) => (
                    <button
                      key={interest}
                      onClick={() => {
                        setFilters({
                          ...filters,
                          interests: filters.interests.includes(interest)
                            ? filters.interests.filter(i => i !== interest)
                            : [...filters.interests, interest]
                        });
                      }}
                      className={`py-1.5 px-3 rounded-full text-sm ${filters.interests.includes(interest)
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Only Toggle */}
              <div className="flex items-center justify-between">
                <label className="font-medium">Show verified only</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={filters.showVerified}
                    onChange={(e) => setFilters({ ...filters, showVerified: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setFilters({
                    ageRange: [18, 35],
                    maxDistance: 50,
                    gender: [],
                    interests: [],
                    showVerified: false,
                  });
                }}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  // Apply filters here
                  console.log('Applying filters:', filters);
                  setShowFilters(false);
                }}
                className="flex-1 py-2.5 px-4 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
