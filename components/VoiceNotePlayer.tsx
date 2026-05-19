"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"

interface VoiceNotePlayerProps {
    audioData: string // Base64 Data URI
    duration?: number // total duration in seconds
    author: "me" | "them"
}

export default function VoiceNotePlayer({ audioData, duration = 0, author }: VoiceNotePlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1)
    const [localUrl, setLocalUrl] = useState<string>("")
    const [isReady, setIsReady] = useState(false)

    // Generate static visual waveform heights
    const waveformBars = [
        12, 24, 16, 32, 20, 28, 14, 22, 10, 18, 30, 24, 16, 26, 12, 20, 28, 14, 22, 12, 18, 24, 16, 30, 14, 20
    ]

    // Pre-download / local cache: Convert base64 data to Blob URL on mount
    useEffect(() => {
        if (!audioData) return

        try {
            // Check if it's already a Data URI
            let base64Content = audioData
            let mimeType = "audio/webm"

            if (audioData.startsWith("data:")) {
                const parts = audioData.split(",")
                const mimePart = audioData.split(";")[0]
                mimeType = mimePart.replace("data:", "")
                base64Content = parts[1]
            }

            // Convert base64 to raw binary data held in a string
            const byteCharacters = atob(base64Content)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: mimeType })
            
            // Create local object URL
            const url = URL.createObjectURL(blob)
            setLocalUrl(url)
            setIsReady(true)

            return () => {
                URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error("Failed to decode base64 audio:", error)
        }
    }, [audioData])

    // Update playback speed
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackSpeed
        }
    }, [playbackSpeed])

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering parent message replies
        if (!audioRef.current || !isReady) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleAudioEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
    }

    const handlePlaybackSpeedToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        setPlaybackSpeed(prev => {
            if (prev === 1) return 1.5
            if (prev === 1.5) return 2
            return 1
        })
    }

    const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (!audioRef.current || !isReady) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        const targetTime = percentage * (audioRef.current.duration || duration || 0)
        
        audioRef.current.currentTime = targetTime
        setCurrentTime(targetTime)
    }

    const formatPlayTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const displayDuration = duration || (audioRef.current?.duration ? Math.round(audioRef.current.duration) : 0)
    const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0

    const isMe = author === "me"

    return (
        <div className={`flex flex-col gap-1.5 w-64 p-1.5 rounded-xl transition-all duration-300 ${
            isMe ? "text-background" : "text-foreground"
        }`}>
            {/* Audio Element */}
            {localUrl && (
                <audio
                    ref={audioRef}
                    src={localUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    preload="auto"
                />
            )}

            {/* Controls Bar */}
            <div className="flex items-center gap-3">
                {/* Play Button */}
                <button
                    onClick={handlePlayPause}
                    disabled={!isReady}
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200 ${
                        isMe 
                            ? "bg-background text-foreground hover:bg-background/90" 
                            : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                    ) : (
                        <Play className="w-4 h-4 fill-current translate-x-[1px]" />
                    )}
                </button>

                {/* Waveform Selector */}
                <div
                    onClick={handleWaveformClick}
                    className="flex-1 flex items-end gap-[3px] h-9 cursor-pointer relative"
                >
                    {waveformBars.map((height, idx) => {
                        const barProgress = (idx / waveformBars.length) * 100
                        const isActive = progressPercent >= barProgress
                        
                        return (
                            <div
                                key={idx}
                                style={{ height: `${height}px` }}
                                className={`w-[3px] rounded-full transition-all duration-200 ${
                                    isActive
                                        ? isMe
                                            ? "bg-background opacity-100"
                                            : "bg-foreground opacity-100"
                                        : isMe
                                            ? "bg-background/40"
                                            : "bg-foreground/25"
                                }`}
                            />
                        )
                    })}
                </div>

                {/* Speed Toggle */}
                <button
                    onClick={handlePlaybackSpeedToggle}
                    className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                        isMe
                            ? "bg-background/20 text-background hover:bg-background/35"
                            : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                    }`}
                >
                    {playbackSpeed}x
                </button>
            </div>

            {/* Time Indicator */}
            <div className="flex justify-between items-center text-[10px] px-1 font-medium select-none">
                <span className={isMe ? "text-background/80" : "text-muted-foreground"}>
                    {formatPlayTime(currentTime)}
                </span>
                <span className={isMe ? "text-background/80" : "text-muted-foreground"}>
                    {formatPlayTime(displayDuration)}
                </span>
            </div>
        </div>
    )
}
