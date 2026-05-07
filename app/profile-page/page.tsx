"use client"

import { Heart, X, Star, MapPin, CheckCircle2, MessageCircle, Compass, MessageSquareHeart, Merge } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
    const [expandAbout, setExpandAbout] = useState(false)
    const [checkedInterests, setCheckedInterests] = useState<string[]>(["Travelling", "Books"])
    const [activeButton, setActiveButton] = useState<string | null>(null)

    const interests = ["Travelling", "Books", "Music", "Dancing", "Modeling"]

    const galleryImages = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
        "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=400&q=80",
        "https://images.unsplash.com/photo-1516987723245-1bcda002c1d6?w=400&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    ]

    const toggleInterest = (interest: string) => {
        setCheckedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Back Button */}
            <div className="bg-white sticky top-0 z-10 border-b border-border">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <button className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2m0 7a1 1 0 110-2 1 1 0 010 2m0 7a1 1 0 110-2 1 1 0 010 2"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                {/* Hero Image */}
                <div className="relative w-full h-[60vh] sm:aspect-[16/9] bg-muted overflow-hidden rounded-none sm:rounded-2xl mx-0 sm:mx-6 mt-0 sm:mt-6 shadow-sm">
                    <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
                        alt="Profile hero"
                        className="w-full h-full object-cover transition-transform duration-300 ease-out hover:scale-[1.02]"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-5 px-4 sm:px-6 mt-5 sm:mt-6 -mb-8 relative z-10">
                    <button className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-muted shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center text-destructive hover:bg-muted transition-all">
                        <X className="w-7 h-7 sm:w-8 sm:h-8" />
                    </button>
                    <button className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-destructive shadow-lg hover:shadow-xl active:scale-95 hover:scale-105 flex items-center justify-center text-white transition-all">
                        <Heart className="w-10 h-10 sm:w-12 sm:h-12 fill-current" />
                    </button>
                    <button className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-muted shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center text-purple-600 hover:bg-muted transition-all">
                        <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-lg p-5 sm:p-6 mx-4 sm:mx-6 mt-12">
                    {/* Profile Info */}
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Jessica Parker, 23</h1>
                            <p className="text-sm sm:text-base text-muted-foreground">Professional model</p>
                        </div>
                        <button className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Location */}
                    <div className="mt-5 sm:mt-6 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-destructive flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Location</p>
                            <div className="flex items-center justify-between">
                                <p className="text-foreground font-medium text-sm sm:text-base">Chicago, IL, United States</p>
                                <span className="text-xs sm:text-sm text-destructive font-medium">1 km</span>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    <div className="mt-5 sm:mt-6">
                        <p className="text-sm text-muted-foreground">About</p>
                        <p className={`text-foreground mt-2 text-sm leading-relaxed ${!expandAbout ? "line-clamp-3" : ""}`}>
                            My name is Jessica Parker and I enjoy meeting new people and finding ways to help them have an uplifting
                            experience. I enjoy reading...
                        </p>
                        <button
                            onClick={() => setExpandAbout(!expandAbout)}
                            className="text-destructive text-sm font-medium mt-2 hover:underline"
                        >
                            {expandAbout ? "Read less" : "Read more"}
                        </button>
                    </div>

                    {/* Interests */}
                    <div className="mt-6">
                        <p className="text-sm text-muted-foreground">Interests</p>
                        <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-3">
                            {interests.map((interest) => (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 transition-all ${checkedInterests.includes(interest)
                                            ? "border-destructive bg-red-50 text-destructive"
                                            : "border-muted bg-white text-foreground hover:border-muted-foreground"
                                        }`}
                                >
                                    {checkedInterests.includes(interest) && <CheckCircle2 className="w-4 h-4" />}
                                    <span className="text-sm font-medium">{interest}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="mt-7 sm:mt-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Gallery</p>
                            <Link href="/profile-page/gallery" className="text-destructive text-sm font-medium hover:underline">See all</Link>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-3.5 sm:mt-4">
                            {galleryImages.slice(0, 6).map((image, idx) => {
                                const bigTile = idx === 0
                                const wideTile = idx === 3
                                return (
                                    <div
                                        key={idx}
                                        className={`relative rounded-xl overflow-hidden bg-muted hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer 
                                            ${bigTile ? 'col-span-2 aspect-[4/3] sm:aspect-[3/2]' : wideTile ? 'sm:col-span-2 sm:aspect-[3/2] aspect-square' : 'aspect-square'}`}
                                    >
                                        <img
                                            src={image || '/placeholder.svg'}
                                            alt={`Gallery ${idx + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Bottom Padding */}
                <div className="h-8" />
            </div>
            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent p-3 md:p-4">
                <div className="mx-auto flex-1 max-w-md flex items-center justify-between rounded-2xl border-[#fcedef] border-2 relative bg-white">
                    <div className="relative">
                        <Button
                            onClick={() => setActiveButton('discover')}
                            className="flex items-center justify-center w-16 h-16"
                            disabled={false}
                            variant={"ghost"}
                        >
                            <Compass className="h-10 w-10"/>
                        </Button>
                        {activeButton === 'discover' && (
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            onClick={() => setActiveButton('likes')}
                            className="flex items-center justify-center w-12 h-12"
                            disabled={false}
                            variant={"ghost"}
                        >
                            <Heart className="w-5 h-5" />
                        </Button>
                        {activeButton === 'likes' && (
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            onClick={() => setActiveButton('messages')}
                            className="flex items-center justify-center w-12 h-12"
                            disabled={false}
                            variant={"ghost"}
                        >
                            <MessageSquareHeart className="w-5 h-5" />
                        </Button>
                        {activeButton === 'messages' && (
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            onClick={() => setActiveButton('more')}
                            className="flex items-center justify-center w-12 h-12"
                            disabled={false}
                            variant={"ghost"}
                        >
                            <Merge className="w-5 h-5" />
                        </Button>
                        {activeButton === 'more' && (
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
