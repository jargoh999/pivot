"use client"

import { useEffect, useState, useRef } from "react"

interface ReactionPickerProps {
    onSelectEmoji: (emoji: string) => void
    onClose: () => void
    anchorRect?: DOMRect | null
}

const LOCAL_FALLBACKS = ["❤️", "😂", "👍", "🔥", "😮", "😢"]

interface EmojihubItem {
    name: string
    unicode: string[]
}

export default function ReactionPicker({ onSelectEmoji, onClose, anchorRect }: ReactionPickerProps) {
    const [emojis, setEmojis] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const pickerRef = useRef<HTMLDivElement | null>(null)

    // Convert U+1F600 style unicode to actual emoji character
    const unicodeToEmoji = (unicodeStr: string) => {
        try {
            const codePoint = parseInt(unicodeStr.replace("U+", ""), 16)
            return String.fromCodePoint(codePoint)
        } catch (e) {
            return ""
        }
    }

    useEffect(() => {
        let active = true

        async function fetchEmojis() {
            try {
                // Fetch from the standard free Emojihub API
                const response = await fetch("https://emojihub.yurace.pro/api/all/category/smileys-and-people")
                if (!response.ok) throw new Error("API failed")
                const data: EmojihubItem[] = await response.json()
                
                if (!active) return

                // Group/filter some specific expressive emojis for reactions
                // Emojihub returns a list of items; let's pick some recognizable ones:
                // We'll target popular reaction names
                const reactionTargets = [
                    "red heart",
                    "face with tears of joy",
                    "thumbs up",
                    "fire",
                    "face screaming in fear",
                    "crying face",
                    "smiling face with heart-eyes",
                    "clapping hands",
                    "party popper",
                    "hundred points"
                ]

                const fetched: string[] = []
                
                // Try to find the target reaction emojis first
                reactionTargets.forEach((targetName) => {
                    const found = data.find((item) => item.name.toLowerCase().includes(targetName))
                    if (found && found.unicode && found.unicode[0]) {
                        const emoji = unicodeToEmoji(found.unicode[0])
                        if (emoji) fetched.push(emoji)
                    }
                })

                // If we didn't find enough, grab the first 8 smileys
                if (fetched.length < 6) {
                    const smileys = data.slice(0, 10).map(item => unicodeToEmoji(item.unicode[0])).filter(Boolean) as string[]
                    fetched.push(...smileys)
                }

                // De-duplicate and fallback if still empty
                const uniqueFetched = Array.from(new Set(fetched))
                if (uniqueFetched.length >= 4) {
                    setEmojis(uniqueFetched.slice(0, 8))
                } else {
                    setEmojis(LOCAL_FALLBACKS)
                }
            } catch (err) {
                console.warn("Failed to fetch from Emojihub API, using local fallbacks:", err)
                if (active) {
                    setEmojis(LOCAL_FALLBACKS)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        fetchEmojis()

        return () => {
            active = false
        }
    }, [])

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [onClose])

    // Calculate positioning
    const getStyle = () => {
        if (!anchorRect) {
            return {
                bottom: "80px",
                left: "50%",
                transform: "translateX(-50%)",
            }
        }

        const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 500
        let left = anchorRect.left + anchorRect.width / 2 - 130 // Half of typical reaction picker width (260px)

        // Prevent overflow
        if (left < 10) left = 10
        if (left + 260 > viewportWidth) left = viewportWidth - 270

        // Position it above the message bubble
        let top = anchorRect.top - 48
        if (top < 50) {
            // Position below if no space above
            top = anchorRect.bottom + 8
        }

        return {
            top: `${top}px`,
            left: `${left}px`,
        }
    }

    const items = loading && emojis.length === 0 ? LOCAL_FALLBACKS : emojis

    return (
        <div
            ref={pickerRef}
            style={getStyle()}
            className="fixed z-50 flex items-center gap-1.5 px-3 py-2 rounded-full border border-border bg-background/90 backdrop-blur-md shadow-lg scale-in-center animate-out fade-out-30 duration-200"
        >
            {items.map((emoji) => (
                <button
                    key={emoji}
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelectEmoji(emoji)
                        onClose()
                    }}
                    className="text-2xl hover:scale-125 active:scale-95 transition-transform duration-150 cursor-pointer p-1 rounded-full hover:bg-muted"
                >
                    {emoji}
                </button>
            ))}
        </div>
    )
}
