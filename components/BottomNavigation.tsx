"use client"

import { Compass, Heart, MessageSquareHeart, Merge } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

interface BottomNavigationProps {
    activeButton?: string | null
    onNavigate?: (button: string) => void
}

export default function BottomNavigation({ activeButton, onNavigate }: BottomNavigationProps) {
    const pathname = usePathname()

    // Auto-determine active button based on current path
    const getActiveButton = () => {
        if (activeButton) return activeButton
        if (pathname.includes('/discover')) return 'discover'
        if (pathname.includes('/matches')) return 'likes'
        if (pathname.includes('/chat')) return 'messages'
        if (pathname.includes('/hotspot')) return 'more'
        return null
    }

    const currentActive = getActiveButton()

    const handleNavigation = (button: string, path: string) => {
        if (onNavigate) {
            onNavigate(button)
        } else {
            window.location.href = path
        }
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
                        onClick={() => handleNavigation('likes', '/matches')}
                        className="flex items-center justify-center w-12 h-12"
                        variant="ghost"
                    >
                        <Heart className="w-5 h-5" />
                    </Button>
                    {currentActive === 'likes' && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                    )}
                </div>

                <div className="relative">
                    <Button
                        onClick={() => handleNavigation('messages', '/chat')}
                        className="flex items-center justify-center w-12 h-12"
                        variant="ghost"
                    >
                        <MessageSquareHeart className="w-5 h-5" />
                    </Button>
                    {currentActive === 'messages' && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                    )}
                </div>

                <div className="relative">
                    <Button
                        onClick={() => handleNavigation('more', '/hotspot')}
                        className="flex items-center justify-center w-12 h-12"
                        variant="ghost"
                    >
                        <Merge className="w-5 h-5" />
                    </Button>
                    {currentActive === 'more' && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                    )}
                </div>
            </div>
        </div>
    )
}
