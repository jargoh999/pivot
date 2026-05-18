"use client"

import { Heart, Compass, MessageSquareHeart, Merge } from "lucide-react"
import { useState } from "react"
import PageHeader from "@/components/PageHeader"
import BottomNavigation from "@/components/BottomNavigation"

export default function MatchPage() {
    const [showMatch, setShowMatch] = useState(true)
    const [activeButton, setActiveButton] = useState<string | null>(null)
    const [hoveredCard, setHoveredCard] = useState<"left" | "right" | null>(null)

    if (!showMatch) return null

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col">
            <PageHeader
                title="It's a Match!"
                subtitle="Start a conversation now"
                showBackButton={true}
                onBack={() => setShowMatch(false)}
            />

            <div className="flex-1 flex flex-col items-center justify-center p-4 pb-28">
                {/* Card Stack Container */}
                <div className="relative w-full max-w-[340px] h-[330px] mb-8 sm:max-w-sm sm:h-96 sm:mb-12 flex items-center justify-center">
                    {/* Left Card - Woman at Beach */}
                    <div
                        className={`absolute w-[200px] h-[300px] sm:w-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl transform -rotate-4 -translate-x-16 translate-y-1 sm:-translate-x-[60px] sm:translate-y-0 border-4 sm:border-8 border-white transition-transform duration-200 ${hoveredCard === "left" ? "z-20 -translate-y-2" : "z-0"
                            }`}
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=280&h=400&fit=crop)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        onMouseEnter={() => setHoveredCard("left")}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        {/* Heart Badge */}
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg z-20">
                            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500  fill-red-500" />
                        </div>
                    </div>

                    {/* Right Card - Man in Denim */}
                    <div
                        className={`absolute w-[200px] h-[300px] sm:w-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl transform rotate-4 translate-x-16 -translate-y-1 sm:translate-x-[60px] sm:-translate-y-0 border-4 sm:border-8 border-white transition-transform duration-200 ${hoveredCard === "right" ? "z-20 -translate-y-2" : "z-10"
                            }`}
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=280&h=400&fit=crop)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                        onMouseEnter={() => setHoveredCard("right")}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        {/* Heart Badge */}
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg z-20">
                            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500" />
                        </div>
                    </div>
                </div>

                {/* Match Message */}
                <div className="text-center mb-6 sm:mb-8 max-w-[280px] sm:max-w-sm">
                    <h1 className="text-3xl sm:text-4xl font-bold text-red-500 mb-2">It's a match, Jake!</h1>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Start a conversation now with each other</p>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-[280px] sm:max-w-sm space-y-3 flex flex-col">
                    <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 sm:py-4 px-6 rounded-full transition-colors shadow-lg">
                        Say hello
                    </button>
                </div>

                <BottomNavigation />
            </div>
        </div>
    )
}
