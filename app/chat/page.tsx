"use client"

import { Search, Sliders, Compass, Heart, MessageSquareHeart, Merge, X, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import BottomNavigation from "@/components/BottomNavigation"

// Helper function to get auth token
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('vibe_chat_token')
    }
    return null
}

interface Message {
    id: string
    name: string
    avatar: string
    lastMessage: string
    time: string
    unread: number
    isTyping?: boolean
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

    // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
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
            }
        }

        fetchConversations()
    }, [])

    // Fetch messages when chat is selected
    useEffect(() => {
        if (!selectedChat) return
        setReplyTarget(null)
        setInputValue("")

        const fetchMessages = async () => {
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
                    setConversations(prev => {
                        const currentChatMsgs = prev[selectedChat.id] || []
                        
                        // 1. Prevent duplicate if the message is already present by real database ID
                        if (currentChatMsgs.some(m => m.id === newMsg.id)) {
                            return prev
                        }

                        // 2. If it's our own message, match and replace the temporary optimistic message
                        if (newMsg.author === 'me') {
                            const tempIndex = currentChatMsgs.findIndex(m => m.id.startsWith('temp-') && m.text === newMsg.text)
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
            <div className="border-b border-border p-4 sm:p-6">
                <div className="flex items-center justify-between max-w-2xl mx-auto px-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
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
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-muted text-foreground placeholder:text-muted-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-destructive"
                        />
                    </div>
                    {/* Filters */}
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-full text-sm border ${filter === 'all' ? 'bg-foreground text-background' : 'bg-background text-foreground border-border'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1.5 rounded-full text-sm border ${filter === 'unread' ? 'bg-foreground text-background' : 'bg-background text-foreground border-border'}`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('typing')}
                            className={`px-3 py-1.5 rounded-full text-sm border ${filter === 'typing' ? 'bg-foreground text-background' : 'bg-background text-foreground border-border'}`}
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
                        {messages
                            .filter((m) =>
                                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                m.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .filter((m) => (filter === 'all' ? true : filter === 'unread' ? m.unread > 0 : !!m.isTyping))
                            .map((message) => (
                                <div
                                    key={message.id}
                                    onClick={() => { setSelectedChat(message); setShowModal(true) }}
                                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted rounded-lg cursor-pointer transition-colors group"
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 border border-muted`}
                                    >
                                        <img
                                            src={message.avatar || "/placeholder.svg"}
                                            alt={message.name}
                                            className="w-full h-full object-cover"
                                        />
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
                                            <div className="w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {message.unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {selectedChat && (
                <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4 ${showModal ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                    <div
                        onClick={() => { setShowModal(false); setTimeout(() => setSelectedChat(null), 200) }}
                        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${showModal ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div
                        className={`relative w-full sm:max-w-md sm:rounded-2xl bg-background sm:shadow-xl sm:border sm:border-border sm:mx-auto sm:my-8 
                        transition-transform duration-200 ease-out 
                        ${showModal ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:scale-95'}
                        rounded-t-2xl`}
                        style={{ willChange: 'transform' }}
                    >
                        <div className="flex items-center gap-3 p-4 border-b border-border">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-muted">
                                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{selectedChat.name}</p>
                                <p className="text-xs text-muted-foreground">Active now</p>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setTimeout(() => setSelectedChat(null), 200) }}
                                className="p-2 rounded-full hover:bg-muted transition"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-4 py-3 space-y-3 h-[65vh] sm:h-[60vh] overflow-y-auto">
                            {(conversations[selectedChat.id] || [])
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
                                        <div key={m.id} className={`flex ${m.author === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`relative max-w-[80%] px-3 py-2 text-sm rounded-2xl ${m.author === 'me' ? 'rounded-br-md bg-foreground text-background' : 'rounded-bl-md bg-muted text-foreground'}`}
                                                onClick={() => setReplyTarget(m)}
                                            >
                                                {m.replyTo && (
                                                    <div className={`absolute ${m.author === 'me' ? 'right-2 -top-3' : 'left-2 -top-3'} z-10`}>
                                                        <div className="px-2 py-1 text-[10px] rounded-full bg-background border border-border text-muted-foreground max-w-[70vw] truncate shadow-sm">
                                                            Reply to {m.replyTo.author === 'me' ? 'You' : selectedChat.name}: {m.replyTo.text}
                                                        </div>
                                                    </div>
                                                )}
                                                <div>{m.text}</div>
                                                <div className={`mt-1 text-[10px] ${m.author === 'me' ? 'text-background/80' : 'text-muted-foreground'}`}>{formatTime(d)}</div>
                                            </div>
                                        </div>
                                    )
                                    acc.lastDate = d
                                    return acc
                                }, { el: [], lastDate: null }).el}
                            <div ref={scrollBottomRef} />
                        </div>

                        <div className="p-3 border-t border-border bg-background sticky bottom-0 space-y-2">
                            {replyTarget && (
                                <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted border border-border">
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">Replying to {replyTarget.author === 'me' ? 'You' : selectedChat.name}</p>
                                        <p className="text-sm truncate text-foreground">{replyTarget.text}</p>
                                    </div>
                                    <button className="p-1 rounded hover:bg-background" onClick={() => setReplyTarget(null)} aria-label="Cancel reply">
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            )}
                            <div className="max-w-2xl mx-auto flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={`Message ${selectedChat.name}`}
                                    className="flex-1 h-11 px-4 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                                />
                                <Button variant="default" className="h-11 px-4 rounded-full" onClick={handleSend}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BottomNavigation />
        </div>
    )
}
