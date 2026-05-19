"use client"

import { Search, Sliders, Compass, Heart, MessageSquareHeart, Merge, X, Send, Mic, Trash2, Image as ImageIcon, Paperclip, Smile } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import BottomNavigation from "@/components/BottomNavigation"
import VoiceNotePlayer from "@/components/VoiceNotePlayer"
import ReactionPicker from "@/components/ReactionPicker"

const LOCAL_FALLBACKS = ["😀", "😂", "🥰", "😍", "😎", "😊", "😉", "🥳", "👍", "🔥", "❤️", "🙌"]

// Helper function to get auth token
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('vibe_chat_token')
    }
    return null
}

function formatLastActive(lastActiveStr?: string | Date | null): string {
    if (!lastActiveStr) return "Offline"
    
    const lastActive = new Date(lastActiveStr)
    const now = new Date()
    
    // Check if truly active (within last 2 minutes)
    const diffMs = now.getTime() - lastActive.getTime()
    const diffMins = diffMs / (1000 * 60)
    
    if (diffMins < 2) {
        return "Active now"
    }
    
    const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayDate = new Date(todayDate)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    
    const timeStr = lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    
    if (lastActiveDate.getTime() === todayDate.getTime()) {
        return `Last seen today - ${timeStr}`
    } else if (lastActiveDate.getTime() === yesterdayDate.getTime()) {
        return `Last seen yesterday - ${timeStr}`
    } else {
        const dateStr = lastActive.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })
        return `Last seen ${dateStr}`
    }
}

interface Message {
    id: string
    name: string
    avatar: string
    lastMessage: string
    time: string
    unread: number
    isTyping?: boolean
    lastActive?: string | null
}

interface Activity {
    id: string
    name: string
    avatar: string
    isSelected?: boolean
}

interface ChatMessage {
    id: string
    author: "me" | "them"
    text: string
    timestamp: string // ISO string
    audioData?: string
    audioDuration?: number
    imageData?: string
    reactions?: { userId: string, emoji: string }[]
    replyTo?: {
        id: string
        text: string
        author: "me" | "them"
    }
}

const activities: Activity[] = [
    {
        id: "1",
        name: "You",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        isSelected: true,
    },
    { id: "2", name: "Emma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
    { id: "3", name: "Ava", avatar: "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=100&q=80" },
    { id: "4", name: "Sophia", avatar: "https://images.unsplash.com/photo-1516987723245-1bcda002c1d6?w=100&q=80" },
    { id: "5", name: "Olivia", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" },
]

export default function MessagesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "unread" | "typing">("all")
    const [activeButton, setActiveButton] = useState<'discover' | 'likes' | 'messages' | 'more'>('messages')
    const [selectedChat, setSelectedChat] = useState<Message | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({})
    const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null)
    const [inputValue, setInputValue] = useState("")
    const scrollBottomRef = useRef<HTMLDivElement | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const eventSourceRef = useRef<EventSource | null>(null)

    // Page loading indicators
    const [loadingConversations, setLoadingConversations] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Reaction and Image sharing states & refs
    const [activeReactionPicker, setActiveReactionPicker] = useState<{ messageId: string, rect: DOMRect } | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    // Input emoji picker and lightbox states
    const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false)
    const [inputEmojis, setInputEmojis] = useState<string[]>([])
    const [loadingInputEmojis, setLoadingInputEmojis] = useState(false)
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    // Decode current user ID from JWT
    const getUserIdFromToken = () => {
        const token = getAuthToken()
        if (!token) return null
        try {
            const payload = token.split(".")[1]
            const decoded = JSON.parse(atob(payload))
            return decoded.userId || null
        } catch (e) {
            return null
        }
    }

    const updateSidebarWithNewMessage = (conversationId: string, text: string, timestamp: string) => {
        const date = new Date(timestamp)
        const timeStr = date.toLocaleString()
        setMessages(prev => {
            const chatIndex = prev.findIndex(c => c.id === conversationId)
            if (chatIndex === -1) return prev
            const updatedChats = [...prev]
            const chat = { 
                ...updatedChats[chatIndex], 
                lastMessage: text, 
                time: timeStr 
            }
            updatedChats.splice(chatIndex, 1)
            return [chat, ...updatedChats]
        })
    }

    const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedChat) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new window.Image()
            img.onload = () => {
                const canvas = document.createElement("canvas")
                const maxDim = 800
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width)
                        width = maxDim
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height)
                        height = maxDim
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext("2d")
                if (!ctx) return

                ctx.drawImage(img, 0, 0, width, height)

                // Client-side WebP compression (0.7 quality)
                const compressedBase64 = canvas.toDataURL("image/webp", 0.7)
                handleSendImage(compressedBase64)
            }
            img.src = event.target?.result as string
        }
        reader.readAsDataURL(file)
        e.target.value = ""
    }

    async function handleSendImage(imageData: string) {
        if (!selectedChat) return

        const token = getAuthToken()
        if (!token) {
            console.error('No auth token')
            return
        }

        // Optimistic UI update
        const optimisticMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            author: "me",
            text: "📷 Photo",
            imageData,
            reactions: [],
            timestamp: new Date().toISOString(),
            replyTo: replyTarget ? { id: replyTarget.id, text: replyTarget.text, author: replyTarget.author } : undefined,
        }

        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))
        updateSidebarWithNewMessage(selectedChat.id, "You: 📷 Photo", optimisticMsg.timestamp)
        setReplyTarget(null)

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId: selectedChat.id,
                    imageData,
                    replyTo: replyTarget ? {
                        id: replyTarget.id,
                        text: replyTarget.text,
                        author: replyTarget.author
                    } : undefined
                })
            })

            if (response.ok) {
                const data = await response.json()
                setConversations((prev) => ({
                    ...prev,
                    [selectedChat.id]: prev[selectedChat.id].map(msg =>
                        msg.id === optimisticMsg.id ? data.message : msg
                    )
                }))
            } else {
                setConversations((prev) => ({
                    ...prev,
                    [selectedChat.id]: prev[selectedChat.id].filter(
                        msg => msg.id !== optimisticMsg.id
                    )
                }))
            }
        } catch (error) {
            console.error('Failed to send image:', error)
            setConversations((prev) => ({
                ...prev,
                [selectedChat.id]: prev[selectedChat.id].filter(
                    msg => msg.id !== optimisticMsg.id
                )
            }))
        }
    }

    const handleToggleReaction = async (messageId: string, emoji: string) => {
        if (!selectedChat) return

        const token = getAuthToken()
        if (!token) return

        const userId = getUserIdFromToken()
        if (!userId) return

        // Optimistic UI update for reactions
        setConversations((prev) => {
            const currentChatMsgs = prev[selectedChat.id] || []
            const updated = currentChatMsgs.map((msg) => {
                if (msg.id === messageId) {
                    const reactions = msg.reactions || []
                    const existingIndex = reactions.findIndex((r) => r.userId === userId)
                    let newReactions = [...reactions]

                    if (existingIndex > -1) {
                        if (reactions[existingIndex].emoji === emoji) {
                            newReactions.splice(existingIndex, 1)
                        } else {
                            newReactions[existingIndex] = { userId, emoji }
                        }
                    } else {
                        newReactions.push({ userId, emoji })
                    }

                    return { ...msg, reactions: newReactions }
                }
                return msg
            })
            return {
                ...prev,
                [selectedChat.id]: updated,
            }
        })

        try {
            const response = await fetch(`/api/messages/${messageId}/react`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ emoji }),
            })

            if (response.ok) {
                const data = await response.json()
                setConversations((prev) => {
                    const currentChatMsgs = prev[selectedChat.id] || []
                    const updated = currentChatMsgs.map((msg) => {
                        if (msg.id === messageId) {
                            return { ...msg, reactions: data.reactions }
                        }
                        return msg
                    })
                    return {
                        ...prev,
                        [selectedChat.id]: updated,
                    }
                })
            }
        } catch (error) {
            console.error("Failed to toggle reaction:", error)
        }
    }

    // Format recording duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            audioChunksRef.current = []

            let options = {}
            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                options = { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 16000 }
            } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
                options = { mimeType: "audio/ogg;codecs=opus", audioBitsPerSecond: 16000 }
            } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
                options = { mimeType: "audio/mp4", audioBitsPerSecond: 16000 }
            }

            const mediaRecorder = new MediaRecorder(stream, options)
            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.start(250)
            setIsRecording(true)
            setRecordingTime(0)

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } catch (err) {
            console.error("Failed to start recording:", err)
            alert("Could not access microphone. Please check permissions.")
        }
    }

    const stopRecording = (shouldSend: boolean) => {
        const recorder = mediaRecorderRef.current
        if (!recorder) return

        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        
        recorder.onstop = async () => {
            if (shouldSend && audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType })
                const duration = recordingTime
                await handleSendVoiceNote(audioBlob, duration)
            }
            
            // Stop stream tracks to release microphone light
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
                streamRef.current = null
            }
        }

        recorder.stop()
        setIsRecording(false)
        setRecordingTime(0)
    }

    const cancelRecording = () => {
        stopRecording(false)
    }

    const sendRecording = () => {
        stopRecording(true)
    }

    async function handleSendVoiceNote(audioBlob: Blob, duration: number) {
        if (!selectedChat) return

        const token = getAuthToken()
        if (!token) {
            console.error('No auth token')
            return
        }

        // Convert audioBlob to Base64 string
        let audioData = ""
        try {
            audioData = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(audioBlob)
            })
        } catch (error) {
            console.error("Failed to convert audio blob to base64:", error)
            return
        }

        // Optimistic UI update
        const optimisticMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            author: "me",
            text: "🎤 Voice Note",
            audioData,
            audioDuration: duration,
            timestamp: new Date().toISOString(),
            replyTo: replyTarget ? { id: replyTarget.id, text: replyTarget.text, author: replyTarget.author } : undefined,
        }

        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))
        updateSidebarWithNewMessage(selectedChat.id, "You: 🎤 Voice Note", optimisticMsg.timestamp)
        setReplyTarget(null)

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId: selectedChat.id,
                    audioData,
                    audioDuration: duration,
                    replyTo: replyTarget ? {
                        id: replyTarget.id,
                        text: replyTarget.text,
                        author: replyTarget.author
                    } : undefined
                })
            })

            if (response.ok) {
                const data = await response.json()
                // Replace optimistic message with real one
                setConversations((prev) => ({
                    ...prev,
                    [selectedChat.id]: prev[selectedChat.id].map(msg =>
                        msg.id === optimisticMsg.id ? data.message : msg
                    )
                }))
            } else {
                // Rollback on error
                setConversations((prev) => ({
                    ...prev,
                    [selectedChat.id]: prev[selectedChat.id].filter(
                        msg => msg.id !== optimisticMsg.id
                    )
                }))
            }
        } catch (error) {
            console.error('Failed to send voice note:', error)
            // Rollback on error
            setConversations((prev) => ({
                ...prev,
                [selectedChat.id]: prev[selectedChat.id].filter(
                    msg => msg.id !== optimisticMsg.id
                )
            }))
        }
    }

    function isSameDay(a: Date, b: Date) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
    }

    function formatDayHeader(date: Date) {
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)
        if (isSameDay(date, today)) return "Today"
        if (isSameDay(date, yesterday)) return "Yesterday"
        return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date)
    }

    function formatTime(date: Date) {
        return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)
    }

    // Fetch input emojis when picker is opened
    useEffect(() => {
        if (!showInputEmojiPicker || inputEmojis.length > 0) return

        let active = true
        async function fetchInputEmojis() {
            setLoadingInputEmojis(true)
            try {
                const response = await fetch("https://emojihub.yurace.pro/api/all/category/smileys-and-people")
                if (!response.ok) throw new Error("API failed")
                const data = await response.json()
                if (!active) return

                const parsed: string[] = []
                data.forEach((item: any) => {
                    if (item.unicode && item.unicode[0]) {
                        try {
                            const codePoint = parseInt(item.unicode[0].replace("U+", ""), 16)
                            const char = String.fromCodePoint(codePoint)
                            if (char) parsed.push(char)
                        } catch (e) {}
                    }
                })

                if (parsed.length > 0) {
                    setInputEmojis(parsed)
                } else {
                    setInputEmojis(LOCAL_FALLBACKS)
                }
            } catch (err) {
                console.warn("Failed to fetch emojis for input panel, using local fallbacks:", err)
                if (active) {
                    setInputEmojis(LOCAL_FALLBACKS)
                }
            } finally {
                if (active) {
                    setLoadingInputEmojis(false)
                }
            }
        }
        fetchInputEmojis()
        return () => {
            active = false
        }
    }, [showInputEmojiPicker, inputEmojis.length])

        // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
            setLoadingConversations(true)
            try {
                const token = getAuthToken()
                if (!token) return

                const response = await fetch('/api/conversations', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setMessages(data.conversations)
                }
            } catch (error) {
                console.error('Failed to fetch conversations:', error)
            } finally {
                setLoadingConversations(false)
            }
        }

        fetchConversations()
    }, [])

        // Fetch messages when chat is selected
    useEffect(() => {
        if (!selectedChat) return
        setReplyTarget(null)
        setInputValue("")

        // Reset unread count to 0 in local state instantly
        setMessages(prev => prev.map(m => m.id === selectedChat.id ? { ...m, unread: 0 } : m))

        const fetchMessages = async () => {
            setLoadingMessages(true)
            try {
                const token = getAuthToken()
                if (!token) return

                const response = await fetch(`/api/conversations/${selectedChat.id}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setConversations(prev => ({
                        ...prev,
                        [selectedChat.id]: data.messages
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error)
            } finally {
                setLoadingMessages(false)
            }
        }

        fetchMessages()

        // Connect to SSE for real-time updates
        const token = getAuthToken()
        if (token) {
            const eventSource = new EventSource(`/api/conversations/${selectedChat.id}/stream?token=${token}`)
            eventSourceRef.current = eventSource

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.type === 'new_message') {
                    const newMsg = data.data
                    updateSidebarWithNewMessage(selectedChat.id, (newMsg.author === 'me' ? 'You: ' : '') + newMsg.text, newMsg.timestamp)
                    setConversations(prev => {
                        const currentChatMsgs = prev[selectedChat.id] || []
                        
                        // 1. Prevent duplicate if the message is already present by real database ID
                        if (currentChatMsgs.some(m => m.id === newMsg.id)) {
                            return prev
                        }
 
                        // 2. If it's our own message, match and replace the temporary optimistic message
                        if (newMsg.author === 'me') {
                            const tempIndex = currentChatMsgs.findIndex(m => m.id.startsWith('temp-') && (m.text === newMsg.text || m.audioData === newMsg.audioData || m.imageData === newMsg.imageData))
                            if (tempIndex !== -1) {
                                const updated = [...currentChatMsgs]
                                updated[tempIndex] = newMsg
                                return {
                                    ...prev,
                                    [selectedChat.id]: updated
                                }
                            }
                        }
 
                        // 3. Otherwise (e.g. from other user or no optimistic match), append it
                        return {
                            ...prev,
                            [selectedChat.id]: [...currentChatMsgs, newMsg]
                        }
                    })
                } else if (data.type === 'message_update') {
                    const updatedMsg = data.data
                    setConversations(prev => {
                        const currentChatMsgs = prev[selectedChat.id] || []
                        const updated = currentChatMsgs.map(m => {
                            if (m.id === updatedMsg.id) {
                                return {
                                    ...m,
                                    reactions: updatedMsg.reactions
                                }
                            }
                            return m
                        })
                        return {
                            ...prev,
                            [selectedChat.id]: updated
                        }
                    })
                }
            }

            return () => {
                eventSource.close()
            }
        }
    }, [selectedChat])

    // Auto-scroll to bottom when conversation changes or modal opens
    useEffect(() => {
        if (!showModal) return
        const t = setTimeout(() => scrollBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0)
        return () => clearTimeout(t)
    }, [showModal, conversations, selectedChat])

    async function handleSend() {
        if (!selectedChat) return
        const text = inputValue.trim()
        if (!text) return

        const token = getAuthToken()
        if (!token) {
            console.error('No auth token')
            return
        }

        // Optimistic UI update
        const optimisticMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            author: "me",
            text,
            timestamp: new Date().toISOString(),
            replyTo: replyTarget ? { id: replyTarget.id, text: replyTarget.text, author: replyTarget.author } : undefined,
        }

        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))
        updateSidebarWithNewMessage(selectedChat.id, "You: " + text, optimisticMsg.timestamp)
        setInputValue("")
        setReplyTarget(null)

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId: selectedChat.id,
                    text,
                    replyTo: replyTarget ? {
                        id: replyTarget.id,
                        text: replyTarget.text,
                        author: replyTarget.author
                    } : undefined
                })
            })

            if (response.ok) {
                const data = await response.json()
                // Replace optimistic message with real one
                setConversations((prev) => ({
                    ...prev,
                    [selectedChat.id]: prev[selectedChat.id].map(msg =>
                        msg.id === optimisticMsg.id ? data.message : msg
                    )
                }))
            } else {
                // Rollback on error
                setConversations((prev) => ({
                    ...prev,
                    [selectedChat.id]: prev[selectedChat.id].filter(
                        msg => msg.id !== optimisticMsg.id
                    )
                }))
            }
        } catch (error) {
            console.error('Failed to send message:', error)
            // Rollback on error
            setConversations((prev) => ({
                ...prev,
                [selectedChat.id]: prev[selectedChat.id].filter(
                    msg => msg.id !== optimisticMsg.id
                )
            }))
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="min-h-screen bg-background pb-28">
                        {/* Header */}
            <div className="border-b border-border bg-white sticky top-0 z-40">
                <div className="flex items-center justify-between max-w-2xl mx-auto p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer text-[#e83f55]" aria-label="Filters">
                        <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="border-b border-border px-4 sm:px-6 py-4">
                <div className="max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-muted text-foreground placeholder:text-muted-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-[#e83f55] transition-all"
                        />
                    </div>
                                        {/* Filters */}
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer ${
                                filter === 'all' 
                                    ? 'bg-[#e83f55] text-white border-[#e83f55] shadow-sm' 
                                    : 'bg-background text-foreground border-border hover:bg-muted'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer ${
                                filter === 'unread' 
                                    ? 'bg-[#e83f55] text-white border-[#e83f55] shadow-sm' 
                                    : 'bg-background text-foreground border-border hover:bg-muted'
                            }`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('typing')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer ${
                                filter === 'typing' 
                                    ? 'bg-[#e83f55] text-white border-[#e83f55] shadow-sm' 
                                    : 'bg-background text-foreground border-border hover:bg-muted'
                            }`}
                        >
                            Typing
                        </button>
                    </div>
                </div>
            </div>

            {/* Activities Section */}
            <div className="border-b border-border px-4 sm:px-6 py-6 sm:py-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Activities</h2>
                    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border cursor-pointer transition-all border-muted`}
                                >
                                    <img
                                        src={activity.avatar || "/placeholder.svg"}
                                        alt={activity.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="text-sm font-medium text-foreground text-center w-20">{activity.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Messages Section */}
            <div className="px-4 sm:px-6 py-6 sm:py-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Messages</h2>
                    <div className="space-y-0">
                        {loadingConversations ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 animate-pulse">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex-shrink-0" />
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="h-4 bg-muted rounded w-24" />
                                            <div className="h-3 bg-muted rounded w-48" />
                                        </div>
                                        <div className="w-12 h-3 bg-muted rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No messages yet
                            </div>
                        ) : (
                            messages
                                .filter((m) =>
                                    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    m.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .filter((m) => (filter === 'all' ? true : filter === 'unread' ? m.unread > 0 : !!m.isTyping))
                                .map((message) => (
                                                                        <div
                                        key={message.id}
                                        onClick={() => { setSelectedChat(message); setShowModal(true) }}
                                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted rounded-lg cursor-pointer transition-colors group ${
                                            selectedChat?.id === message.id ? 'bg-muted/80' : ''
                                        }`}
                                    >
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-muted`}
                                            >
                                                <img
                                                    src={message.avatar || "/placeholder.svg"}
                                                    alt={message.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {formatLastActive(message.lastActive) === "Active now" && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                            )}
                                        </div>

                                        {/* Message Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground">{message.name}</h3>
                                            </div>
                                            <p
                                                className={`text-sm truncate text-muted-foreground`}
                                            >
                                                {message.lastMessage}
                                            </p>
                                        </div>

                                        {/* Time and Unread Badge */}
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <p className="text-sm text-muted-foreground">{message.time}</p>
                                                                                        {message.unread > 0 && (
                                                <div className="w-6 h-6 bg-[#e83f55] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {message.unread}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>

                        {selectedChat && (
                <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4 ${showModal ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                    <div
                        onClick={() => { setShowModal(false); setTimeout(() => setSelectedChat(null), 200) }}
                        className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${showModal ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div
                        className={`relative w-full sm:max-w-md sm:rounded-2xl bg-background sm:shadow-xl sm:border sm:border-border sm:mx-auto sm:my-8 
                        transition-transform duration-200 ease-out 
                        ${showModal ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:scale-95'}
                        rounded-t-2xl`}
                        style={{ willChange: 'transform' }}
                    >
                                                <div className="flex items-center gap-3 p-4 border-b border-border bg-white rounded-t-2xl">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-muted">
                                    <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
                                </div>
                                {formatLastActive(selectedChat.lastActive) === "Active now" && (
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{selectedChat.name}</p>
                                <div className="flex items-center gap-1">
                                    {formatLastActive(selectedChat.lastActive) === "Active now" ? (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                                            <p className="text-[10px] font-medium text-muted-foreground">Active now</p>
                                        </>
                                    ) : (
                                        <p className="text-[10px] font-medium text-muted-foreground">
                                            {formatLastActive(selectedChat.lastActive)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setTimeout(() => setSelectedChat(null), 200) }}
                                className="p-2 rounded-full text-muted-foreground hover:text-[#e83f55] hover:bg-rose-50 transition cursor-pointer"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-4 py-3 space-y-3 h-[65vh] sm:h-[60vh] overflow-y-auto">
                                                        {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-3">
                                    <div className="w-8 h-8 rounded-full border-4 border-muted border-t-[#e83f55] animate-spin" />
                                    <p className="text-xs text-muted-foreground font-medium">Loading messages...</p>
                                </div>
                            ) : (conversations[selectedChat.id] || []).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs py-12">
                                    <p>No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                (conversations[selectedChat.id] || [])
                                    .slice()
                                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                    .reduce<{ el: React.ReactNode[]; lastDate: Date | null }>((acc, m, idx, arr) => {
                                        const d = new Date(m.timestamp)
                                        const needHeader = !acc.lastDate || !isSameDay(acc.lastDate, d)
                                        if (needHeader) {
                                            acc.el.push(
                                                <div key={`hdr-${m.id}`} className="flex items-center gap-3 py-2">
                                                    <div className="h-px flex-1 bg-border" />
                                                    <span className="text-xs text-muted-foreground">{formatDayHeader(d)}</span>
                                                    <div className="h-px flex-1 bg-border" />
                                                </div>
                                            )
                                        }
                                        acc.el.push(
                                                                                        <div key={m.id} className={`flex ${m.author === 'me' ? 'justify-end' : 'justify-start'} mb-2`}>
                                                <div 
                                                    className={`relative max-w-[80%] px-3 py-2 text-sm rounded-2xl ${
                                                        m.author === 'me' ? 'rounded-br-md bg-[#e83f55] text-white shadow-sm' : 'rounded-bl-md bg-muted text-foreground'
                                                    }`}
                                                    onClick={() => setReplyTarget(m)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault()
                                                        const rect = e.currentTarget.getBoundingClientRect()
                                                        setActiveReactionPicker({
                                                            messageId: m.id,
                                                            rect
                                                        })
                                                    }}
                                                >
                                                    {m.replyTo && (
                                                        <div className={`mb-1.5 px-2 py-1 text-[11px] rounded-lg border-l-2 ${
                                                            m.author === 'me' 
                                                                ? 'bg-white/15 border-white text-white/90' 
                                                                : 'bg-black/5 border-[#e83f55] text-muted-foreground'
                                                        } truncate`}>
                                                            <span className="font-semibold block text-[10px]">
                                                                {m.replyTo.author === 'me' ? 'You' : selectedChat.name}
                                                            </span>
                                                            {m.replyTo.text}
                                                        </div>
                                                    )}
                                                    {m.imageData ? (
                                                        <div className="space-y-1">
                                                            <div className="max-w-full rounded-lg overflow-hidden border border-border/10 bg-muted/20">
                                                                <img 
                                                                    src={m.imageData} 
                                                                    alt="Shared photo" 
                                                                    className="max-h-60 object-cover rounded-md cursor-pointer hover:opacity-95 transition-opacity" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setLightboxImage(m.imageData || null)
                                                                    }}
                                                                />
                                                            </div>
                                                            {m.text !== "📷 Photo" && <div>{m.text}</div>}
                                                        </div>
                                                    ) : m.audioData ? (
                                                        <VoiceNotePlayer
                                                            audioData={m.audioData}
                                                            duration={m.audioDuration}
                                                            author={m.author}
                                                        />
                                                    ) : (
                                                        <div>{m.text}</div>
                                                    )}
                                                                                                        <div className={`mt-1 text-[10px] ${m.author === 'me' ? 'text-white/80' : 'text-muted-foreground'}`}>{formatTime(d)}</div>

                                                    {/* Reaction Badges */}
                                                    {m.reactions && m.reactions.length > 0 && (
                                                        <div className={`absolute -bottom-2 ${m.author === 'me' ? 'left-2' : 'right-2'} flex gap-0.5 z-10`}>
                                                            {Array.from(new Set(m.reactions.map(r => r.emoji))).map((emoji, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className="w-5 h-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-xs hover:scale-110 transition cursor-pointer"
                                                                    title={`${m.reactions?.filter(r => r.emoji === emoji).length} reaction(s)`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleToggleReaction(m.id, emoji)
                                                                    }}
                                                                >
                                                                    {emoji}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                        acc.lastDate = d
                                        return acc
                                    }, { el: [], lastDate: null }).el
                            )}
                            <div ref={scrollBottomRef} />
                        </div>

                                                <div className="p-3 border-t border-border bg-white sticky bottom-0 space-y-2 rounded-b-2xl">
                            {/* Input Emoji Picker Popup */}
                            {showInputEmojiPicker && (
                                <div className="absolute bottom-16 left-3 right-3 max-w-sm border border-border bg-background/95 backdrop-blur-md shadow-lg rounded-2xl p-3 z-30 animate-in slide-in-from-bottom-2 duration-150">
                                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-border">
                                        <span className="text-xs font-semibold text-muted-foreground">Emojis</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowInputEmojiPicker(false)} 
                                            className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                                                        {loadingInputEmojis ? (
                                        <div className="flex items-center justify-center py-6">
                                            <div className="w-4 h-4 rounded-full border-2 border-muted border-t-[#e83f55] animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto pr-1">
                                            {inputEmojis.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => setInputValue((prev) => prev + emoji)}
                                                    className="text-2xl hover:scale-125 active:scale-95 transition-transform duration-100 p-1 hover:bg-muted rounded cursor-pointer text-center"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                                                        {replyTarget && (
                                <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-3 py-2 rounded-r-xl rounded-l-md bg-muted border-y border-r border-border border-l-4 border-l-[#e83f55]">
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Replying to {replyTarget.author === 'me' ? 'You' : selectedChat.name}</p>
                                        <p className="text-sm truncate text-foreground">{replyTarget.text}</p>
                                    </div>
                                    <button className="p-1 rounded hover:bg-background cursor-pointer" onClick={() => setReplyTarget(null)} aria-label="Cancel reply">
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            )}
                            {isRecording ? (
                                <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 h-11 px-4 rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-ping" />
                                        <span className="text-sm font-semibold">Recording {formatDuration(recordingTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={cancelRecording}
                                            className="p-2 hover:bg-destructive/25 rounded-full transition-colors cursor-pointer text-destructive"
                                            aria-label="Cancel recording"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={sendRecording}
                                            className="p-2 bg-destructive text-white rounded-full transition-colors cursor-pointer hover:bg-destructive/90 shadow-sm"
                                            aria-label="Send recording"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-2xl mx-auto flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleSelectImage}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 rounded-full hover:bg-muted text-muted-foreground transition duration-150 cursor-pointer flex-shrink-0"
                                        aria-label="Send photo"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                                                        <button
                                        type="button"
                                        onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                                        className={`p-2.5 rounded-full hover:bg-muted transition duration-150 cursor-pointer flex-shrink-0 ${
                                            showInputEmojiPicker ? "text-[#e83f55]" : "text-muted-foreground"
                                        }`}
                                        aria-label="Toggle emoji selector"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Message ${selectedChat.name}`}
                                        className="flex-1 h-11 px-4 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#e83f55] transition-all"
                                    />
                                    {inputValue.trim() ? (
                                        <Button 
                                            variant="default" 
                                            className="h-11 w-11 rounded-full bg-[#e83f55] hover:bg-[#d62a3f] text-white cursor-pointer flex-shrink-0 flex items-center justify-center p-0 transition-transform active:scale-95" 
                                            onClick={handleSend}
                                        >
                                            <Send className="w-4 h-4 translate-x-[1px]" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="default" 
                                            className="h-11 w-11 rounded-full bg-[#e83f55] hover:bg-[#d62a3f] text-white cursor-pointer flex-shrink-0 flex items-center justify-center p-0 transition-transform active:scale-95" 
                                            onClick={startRecording} 
                                            aria-label="Record voice note"
                                        >
                                            <Mic className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reaction Picker Overlay */}
            {activeReactionPicker && (
                <ReactionPicker
                    anchorRect={activeReactionPicker.rect}
                    onSelectEmoji={(emoji) => handleToggleReaction(activeReactionPicker.messageId, emoji)}
                    onClose={() => setActiveReactionPicker(null)}
                />
            )}

            {/* Lightbox Overlay */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
                        onClick={() => setLightboxImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img 
                        src={lightboxImage} 
                        alt="Shared photo preview" 
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in scale-in duration-150"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
 
            <BottomNavigation />
        </div>
    )
}
