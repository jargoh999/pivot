"use client"

import { Heart, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import BottomNavigation from "@/components/BottomNavigation"

interface Profile {
    id: number
    name: string
    age: number
    image: string
    date: "today" | "yesterday"
    type: "match" | "like"
}

const profiles: Profile[] = [
    {
        id: 1,
        name: "Leilani",
        age: 19,
        image: "https://picsum.photos/seed/leilani/800/1200",
        date: "today",
        type: "match",
    },
    {
        id: 2,
        name: "Annabelle",
        age: 20,
        image: "https://picsum.photos/seed/annabelle/800/1200",
        date: "today",
        type: "like",
    },
    {
        id: 3,
        name: "Reagan",
        age: 24,
        image: "https://picsum.photos/seed/reagan/800/1200",
        date: "today",
        type: "match",
    },
    {
        id: 4,
        name: "Leah",
        age: 23,
        image: "https://picsum.photos/seed/leah/800/1200",
        date: "today",
        type: "like",
    },
    {
        id: 5,
        name: "Profile",
        age: 22,
        image: "https://picsum.photos/seed/profile5/800/1200",
        date: "yesterday",
        type: "like",
    },
    {
        id: 6,
        name: "Profile",
        age: 21,
        image: "https://picsum.photos/seed/profile6/800/1200",
        date: "yesterday",
        type: "match",
    },
    {
        id: 7,
        name: "Alex",
        age: 25,
        image: "", // will fall back to placeholder dummy image
        date: "today",
        type: "like",
    },
    {
        id: 8,
        name: "Taylor",
        age: 26,
        image: "https://picsum.photos/seed/taylor/800/1200",
        date: "yesterday",
        type: "like",
    },
    {
        id: 9,
        name: "Jordan",
        age: 27,
        image: "", // fallback to placeholder
        date: "yesterday",
        type: "match",
    },
]

export default function MatchesPage() {
    const [likedIds, setLikedIds] = useState<number[]>([])
    const [filterDate, setFilterDate] = useState<"all" | "today" | "yesterday">("all")
    const [filterType, setFilterType] = useState<"all" | "match" | "like">("all")

    const toggleLike = (id: number) => {
        setLikedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
    }

    const byType = (p: Profile) => (filterType === "all" ? true : p.type === filterType)
    const byDate = (date: "today" | "yesterday") =>
        filterDate === "all" ? true : filterDate === date

    const todayProfiles = profiles.filter((p) => p.date === "today" && byType(p) && byDate("today"))
    const yesterdayProfiles = profiles.filter((p) => p.date === "yesterday" && byType(p) && byDate("yesterday"))

    return (
        <div className="min-h-screen bg-white px-4 py-6 pb-28 sm:px-5 md:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="mb-6 sm:mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-black">Matches</h1>
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">This is a list of people who have liked you and your matches.</p>
                    </div>

                </div>

                {/* Filters */}
                <div className="mb-5 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilterDate("all")}
                            className={`px-3 py-1.5 text-xs rounded-full border ${filterDate === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                        >
                            All Dates
                        </button>
                        <button
                            onClick={() => setFilterDate("today")}
                            className={`px-3 py-1.5 text-xs rounded-full border ${filterDate === "today" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setFilterDate("yesterday")}
                            className={`px-3 py-1.5 text-xs rounded-full border ${filterDate === "yesterday" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                        >
                            Yesterday
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilterType("all")}
                            className={`px-3 py-1.5 text-xs rounded-full border ${filterType === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterType("match")}
                            className={`px-3 py-1.5 text-xs rounded-full border ${filterType === "match" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                        >
                            Matches
                        </button>
                        <button
                            onClick={() => setFilterType("like")}
                            className={`px-3 py-1.5 text-xs rounded-full border ${filterType === "like" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                        >
                            Likes
                        </button>
                    </div>
                </div>

                {/* Today Section */}
                <div className="mb-8 sm:mb-10">
                    <div className="mb-3 sm:mb-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Today</h2>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                        {todayProfiles.map((profile) => (
                            <ProfileCard
                                key={profile.id}
                                profile={profile}
                                isLiked={likedIds.includes(profile.id)}
                                isMatch={profile.type === "match"}
                                onLike={() => toggleLike(profile.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Yesterday Section */}
                {yesterdayProfiles.length > 0 && (
                    <div>
                        <div className="mb-3 sm:mb-4 flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200" />
                            <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Yesterday</h2>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                            {yesterdayProfiles.map((profile) => (
                                <ProfileCard
                                    key={profile.id}
                                    profile={profile}
                                    isLiked={likedIds.includes(profile.id)}
                                    isMatch={profile.type === "match"}
                                    onLike={() => toggleLike(profile.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {/* Bottom Navigation */}
                <BottomNavigation />
            </div>
        </div>
    )
}

interface ProfileCardProps {
    profile: Profile
    isLiked: boolean
    isMatch: boolean
    onLike: () => void
}

function ProfileCard({ profile, isLiked, isMatch, onLike }: ProfileCardProps) {
    return (
        <div className="group relative h-48 sm:h-64 overflow-hidden rounded-2xl sm:rounded-3xl">
            <Image src={profile.image || "/placeholder.svg"} alt={profile.name} fill className="object-cover" />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

            {/* Match badge (top-right) */}
            {isMatch && (
                <div className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-sm">
                    <Heart className="h-4 w-4 text-white" fill="currentColor" />
                </div>
            )}

            {/* Profile info and buttons */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4">
                {/* Name and age */}
                <div className="flex flex-col text-white">
                    <h3 className="text-base sm:text-lg font-semibold">
                        {profile.name}, {profile.age}
                    </h3>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 sm:gap-3">
                    {/* Reject button */}
                    <button className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-all hover:bg-white/30">
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </button>

                    {/* Like button */}
                    <button
                        onClick={onLike}
                        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-all hover:bg-white/30"
                    >
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill={isLiked ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
    )
}
