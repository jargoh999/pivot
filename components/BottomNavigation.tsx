"use client"

import { Compass, Heart, MessageSquareHeart, Merge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"

export default function BottomNavigation() {
    const pathname = usePathname()
    const router = useRouter()

    // Auto-determine active button based on current path
    const getActiveButton = () => {
        if (pathname === '/discover') return 'discover'
        if (pathname === '/matches') return 'matches'
        if (pathname === '/chat') return 'chat'
        if (pathname === '/hotspot') return 'hotspot'
        return null
    }

    const currentActive = getActiveButton()

    const handleNavigation = (button: string, path: string) => {
        router.push(path)
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent p-3 md:p-4">
            <div className="mx-auto flex-1 max-w-md flex items-center justify-between rounded-2xl border-[#fcedef] border-2 relative bg-white">
                <div className="relative">
                    <Button
                        onClick={() => handleNavigation('discover', '/discover')}
                        className="flex items-center justify-center w-16 h-16"
                        variant="ghost"
                    >
                        <Compass className="h-10 w-10" />
                    </Button>
                    {currentActive === 'discover' && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                    )}
                </div>

                <div className="relative">
                    <Button
                        onClick={() => handleNavigation('matches', '/matches')}
                        className="flex items-center justify-center w-12 h-12"
                        variant="ghost"
                    >
                        <Heart className="w-5 h-5" />
                    </Button>
                    {currentActive === 'matches' && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                    )}
                </div>

                <div className="relative">
                    <Button
                        onClick={() => handleNavigation('chat', '/chat')}
                        className="flex items-center justify-center w-12 h-12"
                        variant="ghost"
                    >
                        <MessageSquareHeart className="w-5 h-5" />
                    </Button>
                    {currentActive === 'chat' && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                    )}
                </div>

                <div className="relative">
                    <Button
                        onClick={() => handleNavigation('hotspot', '/hotspot')}
                        className="flex items-center justify-center w-12 h-12"
                        variant="ghost"
                    >
                        <Merge className="w-5 h-5" />
                    </Button>
                    {currentActive === 'hotspot' && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                    )}
                </div>
            </div>
        </div>
    )
}
