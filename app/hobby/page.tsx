"use client"

import { useState } from "react"
import {
    ChevronLeft,
    Camera,
    ShoppingBag,
    Mic2,
    Flower2,
    ShoppingCart,
    AlertTriangle,
    Zap,
    Wind,
    Palette,
    Plane,
    Music,
    Gamepad2,
    Wine,
} from "lucide-react"

export default function InterestsSelection() {
    const [selectedInterests, setSelectedInterests] = useState(["Shopping", "Run", "Traveling"])

    const interests = [
        { id: "photography", label: "Photography", icon: Camera },
        { id: "shopping", label: "Shopping", icon: ShoppingBag },
        { id: "karaoke", label: "Karaoke", icon: Mic2 },
        { id: "yoga", label: "Yoga", icon: Flower2 },
        { id: "cooking", label: "Cooking", icon: ShoppingCart },
        { id: "tennis", label: "Tennis", icon: AlertTriangle },
        { id: "run", label: "Run", icon: Zap },
        { id: "swimming", label: "Swimming", icon: Wind },
        { id: "art", label: "Art", icon: Palette },
        { id: "traveling", label: "Traveling", icon: Plane },
        { id: "extreme", label: "Extreme", icon: AlertTriangle },
        { id: "music", label: "Music", icon: Music },
        { id: "drink", label: "Drink", icon: Wine },
        { id: "videogames", label: "Video games", icon: Gamepad2 },
    ]

    const toggleInterest = (label: string) => {
        setSelectedInterests((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors">
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button className="text-sm font-medium text-[#EF4444] hover:text-red-600 transition-colors">Skip</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-6 py-4">
                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-3">Your interests</h1>
                    <p className="text-muted-foreground text-sm">
                        Select a few of your interests and let everyone know what you're passionate about.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {interests.map((interest) => {
                        const IconComponent = interest.icon
                        const isSelected = selectedInterests.includes(interest.label)
                        return (
                            <button
                                key={interest.id}
                                onClick={() => toggleInterest(interest.label)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all ${isSelected
                                        ? "bg-[#EF4444] border-[#EF4444] text-white"
                                        : "bg-background border-border text-foreground hover:border-foreground"
                                    }`}
                            >
                                <IconComponent className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium text-sm">{interest.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Continue Button */}
            <div className="px-6 pb-8">
                <button className="w-full bg-[#EF4444] hover:bg-red-600 text-white font-semibold py-4 rounded-2xl transition-colors">
                    Continue
                </button>
            </div>
        </div>
    )
}
