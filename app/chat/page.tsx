"use client"

import { Search, Sliders, Compass, Heart, MessageSquareHeart, Merge, X, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

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

const messages: Message[] = [
    {
        id: "1",
        name: "Emelie",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        lastMessage: "Sticker 😊",
        time: "23 min",
        unread: 1,
    },
    {
        id: "2",
        name: "Abigail",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        lastMessage: "Typing..",
        time: "27 min",
        unread: 2,
        isTyping: true,
    },
    {
        id: "3",
        name: "Elizabeth",
        avatar: "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=100&q=80",
        lastMessage: "Ok, see you then.",
        time: "33 min",
        unread: 0,
    },
    {
        id: "4",
        name: "Penelope",
        avatar: "https://images.unsplash.com/photo-1516987723245-1bcda002c1d6?w=100&q=80",
        lastMessage: "You: Hey! What's up, long time..",
        time: "50 min",
        unread: 0,
    },
    {
        id: "5",
        name: "Chloe",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
        lastMessage: "You: Hello how are you?",
        time: "55 min",
        unread: 0,
    },
    {
        id: "6",
        name: "Grace",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        lastMessage: "You: Great! I will write later",
        time: "1 hour",
        unread: 0,
    },
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

    // Seed a simple conversation when opening a chat for the first time
    useEffect(() => {
        if (!selectedChat) return
        setReplyTarget(null)
        setInputValue("")
        setConversations((prev) => {
            if (prev[selectedChat.id]) return prev
            const now = new Date()
            const day = (n: number) => { const d = new Date(now); d.setDate(now.getDate() - n); return d }
            const at = (d: Date, h: number, m: number) => { const t = new Date(d); t.setHours(h, m, 0, 0); return t.toISOString() }

            const d7 = day(7)
            const d6 = day(6)
            const d5 = day(5)
            const d4 = day(4)
            const d3 = day(3)
            const d2 = day(2)
            const d1 = day(1)
            const d0 = now

            const seed: ChatMessage[] = []

            // 7 days ago
            seed.push({ id: "w7a", author: "them", text: "Hey there!", timestamp: at(d7, 9, 12) })
            seed.push({ id: "w7b", author: "me", text: `Hi ${selectedChat.name}!`, timestamp: at(d7, 9, 14) })
            seed.push({ id: "w7c", author: "them", text: "Got a minute later today?", timestamp: at(d7, 9, 16) })

            // 6 days ago
            seed.push({ id: "w6a", author: "me", text: "Yep, after lunch works.", timestamp: at(d6, 12, 5) })
            seed.push({ id: "w6b", author: "them", text: "Perfect, talk then!", timestamp: at(d6, 12, 7) })

            // 5 days ago with reply
            seed.push({ id: "w5a", author: "them", text: "How was your day?", timestamp: at(d5, 18, 22) })
            seed.push({ id: "w5b", author: "me", text: "Pretty good, shipped a feature.", timestamp: at(d5, 18, 30) })
            seed.push({ id: "w5c", author: "them", text: "Nice! Congrats 🎉", timestamp: at(d5, 18, 33) })
            seed.push({ id: "w5d", author: "me", text: "Thanks!", timestamp: at(d5, 18, 34), replyTo: { id: "w5c", text: "Nice! Congrats 🎉", author: "them" } })

            // 4 days ago thread
            seed.push({ id: "w4a", author: "them", text: "Movie night suggestions?", timestamp: at(d4, 20, 3) })
            seed.push({ id: "w4b", author: "me", text: "Maybe a thriller.", timestamp: at(d4, 20, 6), replyTo: { id: "w4a", text: "Movie night suggestions?", author: "them" } })
            seed.push({ id: "w4c", author: "them", text: "Let's do it.", timestamp: at(d4, 20, 9) })

            // 3 days ago
            seed.push({ id: "w3a", author: "them", text: "Coffee tomorrow?", timestamp: at(d3, 10, 10) })
            seed.push({ id: "w3b", author: "me", text: "Yes, 11am?", timestamp: at(d3, 10, 13), replyTo: { id: "w3a", text: "Coffee tomorrow?", author: "them" } })
            seed.push({ id: "w3c", author: "them", text: "11 works.", timestamp: at(d3, 10, 15) })

            // 2 days ago more replies
            seed.push({ id: "w2a", author: "them", text: "That cafe was great.", timestamp: at(d2, 16, 40) })
            seed.push({ id: "w2b", author: "me", text: "Glad you liked it!", timestamp: at(d2, 16, 45), replyTo: { id: "w2a", text: "That cafe was great.", author: "them" } })
            seed.push({ id: "w2c", author: "them", text: "We should go again.", timestamp: at(d2, 16, 50) })
            seed.push({ id: "w2d", author: "me", text: "This weekend?", timestamp: at(d2, 16, 55) })

            // Yesterday
            seed.push({ id: "y1", author: "them", text: "How's your week going?", timestamp: at(d1, 14, 5) })
            seed.push({ id: "y2", author: "me", text: "Busy but good.", timestamp: at(d1, 14, 7), replyTo: { id: "y1", text: "How's your week going?", author: "them" } })
            seed.push({ id: "y3", author: "them", text: "Same here 😅", timestamp: at(d1, 14, 9) })
            seed.push({ id: "y4", author: "me", text: "Hang in there!", timestamp: at(d1, 14, 12) })

            // Today with multiple stacked replies
            seed.push({ id: "t1", author: "them", text: "Free later today?", timestamp: at(d0, 9, 20) })
            seed.push({ id: "t2", author: "me", text: "After 6pm works.", timestamp: at(d0, 9, 25), replyTo: { id: "t1", text: "Free later today?", author: "them" } })
            seed.push({ id: "t3", author: "them", text: "Cool, dinner?", timestamp: at(d0, 9, 27) })
            seed.push({ id: "t4", author: "me", text: "Let's do sushi.", timestamp: at(d0, 9, 30), replyTo: { id: "t3", text: "Cool, dinner?", author: "them" } })
            seed.push({ id: "t5", author: "them", text: "Amazing choice.", timestamp: at(d0, 9, 31) })
            seed.push({ id: "t6", author: "me", text: "I'll book a table.", timestamp: at(d0, 9, 33), replyTo: { id: "t5", text: "Amazing choice.", author: "them" } })

            return { ...prev, [selectedChat.id]: seed }
        })
    }, [selectedChat])

    // Auto-scroll to bottom when conversation changes or modal opens
    useEffect(() => {
        if (!showModal) return
        const t = setTimeout(() => scrollBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0)
        return () => clearTimeout(t)
    }, [showModal, conversations, selectedChat])

    function handleSend() {
        if (!selectedChat) return
        const text = inputValue.trim()
        if (!text) return
        const newMsg: ChatMessage = {
            id: `${Date.now()}`,
            author: "me",
            text,
            timestamp: new Date().toISOString(),
            replyTo: replyTarget ? { id: replyTarget.id, text: replyTarget.text, author: replyTarget.author } : undefined,
        }
        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
        }))
        setInputValue("")
        setReplyTarget(null)
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
                                                    <div className={`absolute ${m.author === 'me' ? 'right-2 -top-3' : 'left-2 -top-3'} z-10` }>
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

            {/* Bottom Control Buttons */}
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
