const fs = require('fs');
const filePath = 'c:\\Users\\DELL\\Downloads\\vibe-chat\\app\\chat\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    {
        // 1. Header
        old: `            {/* Header */}
            <div className="border-b border-border p-4 sm:p-6">
                <div className="flex items-center justify-between max-w-2xl mx-auto px-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <Sliders className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                    </button>
                </div>
            </div>`,
        new: `            {/* Header */}
            <div className="border-b border-border bg-white sticky top-0 z-40">
                <div className="flex items-center justify-between max-w-2xl mx-auto p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer text-[#e83f55]" aria-label="Filters">
                        <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>`
    },
    {
        // 2. Search Input Focus ring
        old: `                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-muted text-foreground placeholder:text-muted-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-destructive"
                        />`,
        new: `                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-muted text-foreground placeholder:text-muted-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-[#e83f55] transition-all"
                        />`
    },
    {
        // 3. Filters
        old: `                    {/* Filters */}
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFilter('all')}
                            className={\`px-3 py-1.5 rounded-full text-sm border \${filter === 'all' ? 'bg-foreground text-background' : 'bg-background text-foreground border-border'}\`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={\`px-3 py-1.5 rounded-full text-sm border \${filter === 'unread' ? 'bg-foreground text-background' : 'bg-background text-foreground border-border'}\`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('typing')}
                            className={\`px-3 py-1.5 rounded-full text-sm border \${filter === 'typing' ? 'bg-foreground text-background' : 'bg-background text-foreground border-border'}\`}
                        >
                            Typing
                        </button>
                    </div>`,
        new: `                    {/* Filters */}
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFilter('all')}
                            className={\`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer \${
                                filter === 'all' 
                                    ? 'bg-[#e83f55] text-white border-[#e83f55] shadow-sm' 
                                    : 'bg-background text-foreground border-border hover:bg-muted'
                            }\`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={\`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer \${
                                filter === 'unread' 
                                    ? 'bg-[#e83f55] text-white border-[#e83f55] shadow-sm' 
                                    : 'bg-background text-foreground border-border hover:bg-muted'
                            }\`}
                        >
                            Unread
                        </button>
                        <button
                            onClick={() => setFilter('typing')}
                            className={\`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border cursor-pointer \${
                                filter === 'typing' 
                                    ? 'bg-[#e83f55] text-white border-[#e83f55] shadow-sm' 
                                    : 'bg-background text-foreground border-border hover:bg-muted'
                            }\`}
                        >
                            Typing
                        </button>
                    </div>`
    },
    {
        // 4. Conversation item wrapper select status
        old: `                                    <div
                                        key={message.id}
                                        onClick={() => { setSelectedChat(message); setShowModal(true) }}
                                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted rounded-lg cursor-pointer transition-colors group"
                                    >`,
        new: `                                    <div
                                        key={message.id}
                                        onClick={() => { setSelectedChat(message); setShowModal(true) }}
                                        className={\`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-muted rounded-lg cursor-pointer transition-colors group \${
                                            selectedChat?.id === message.id ? 'bg-muted/80' : ''
                                        }\`}
                                    >`
    },
    {
        // 5. Sidebar item unread count badge background color
        old: `                                            {message.unread > 0 && (
                                                <div className="w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                    {message.unread}
                                                </div>
                                            )}`,
        new: `                                            {message.unread > 0 && (
                                                <div className="w-6 h-6 bg-[#e83f55] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {message.unread}
                                                </div>
                                            )}`
    },
    {
        // 6. Modal container overlay bg & blur
        old: `            {selectedChat && (
                <div className={\`fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4 \${showModal ? 'pointer-events-auto' : 'pointer-events-none'}\`}>
                    <div
                        onClick={() => { setShowModal(false); setTimeout(() => setSelectedChat(null), 200) }}
                        className={\`absolute inset-0 bg-black/50 transition-opacity duration-200 \${showModal ? 'opacity-100' : 'opacity-0'}\`}
                    />`,
        new: `            {selectedChat && (
                <div className={\`fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4 \${showModal ? 'pointer-events-auto' : 'pointer-events-none'}\`}>
                    <div
                        onClick={() => { setShowModal(false); setTimeout(() => setSelectedChat(null), 200) }}
                        className={\`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 \${showModal ? 'opacity-100' : 'opacity-0'}\`}
                    />`
    },
    {
        // 7. Modal header design
        old: `                        <div className="flex items-center gap-3 p-4 border-b border-border">
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
                        </div>`,
        new: `                        <div className="flex items-center gap-3 p-4 border-b border-border bg-white rounded-t-2xl">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-muted">
                                    <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{selectedChat.name}</p>
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                                    <p className="text-[10px] font-medium text-muted-foreground">Active now</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setShowModal(false); setTimeout(() => setSelectedChat(null), 200) }}
                                className="p-2 rounded-full text-muted-foreground hover:text-[#e83f55] hover:bg-rose-50 transition cursor-pointer"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>`
    },
    {
        // 8. Loader spinner color in messages
        old: `                            {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-3">
                                    <div className="w-8 h-8 rounded-full border-4 border-muted border-t-destructive animate-spin" />
                                    <p className="text-xs text-muted-foreground font-medium">Loading messages...</p>
                                </div>`,
        new: `                            {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-3">
                                    <div className="w-8 h-8 rounded-full border-4 border-muted border-t-[#e83f55] animate-spin" />
                                    <p className="text-xs text-muted-foreground font-medium">Loading messages...</p>
                                </div>`
    },
    {
        // 9. Message bubbles and reply styling
        old: `                                            <div key={m.id} className={\`flex \${m.author === 'me' ? 'justify-end' : 'justify-start'} mb-2\`}>
                                                <div 
                                                    className={\`relative max-w-[80%] px-3 py-2 text-sm rounded-2xl \${
                                                        m.author === 'me' ? 'rounded-br-md bg-foreground text-background' : 'rounded-bl-md bg-muted text-foreground'
                                                    }\`}
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
                                                        <div className={\`absolute \${m.author === 'me' ? 'right-2 -top-3' : 'left-2 -top-3'} z-10\`}>
                                                            <div className="px-2 py-1 text-[10px] rounded-full bg-background border border-border text-muted-foreground max-w-[70vw] truncate shadow-sm">
                                                                Reply to {m.replyTo.author === 'me' ? 'You' : selectedChat.name}: {m.replyTo.text}
                                                            </div>
                                                        </div>
                                                    )}`,
        new: `                                            <div key={m.id} className={\`flex \${m.author === 'me' ? 'justify-end' : 'justify-start'} mb-2\`}>
                                                <div 
                                                    className={\`relative max-w-[80%] px-3 py-2 text-sm rounded-2xl \${
                                                        m.author === 'me' ? 'rounded-br-md bg-[#e83f55] text-white shadow-sm' : 'rounded-bl-md bg-muted text-foreground'
                                                    }\`}
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
                                                        <div className={\`mb-1.5 px-2 py-1 text-[11px] rounded-lg border-l-2 \${
                                                            m.author === 'me' 
                                                                ? 'bg-white/15 border-white text-white/90' 
                                                                : 'bg-black/5 border-[#e83f55] text-muted-foreground'
                                                        } truncate\`}>
                                                            <span className="font-semibold block text-[10px]">
                                                                {m.replyTo.author === 'me' ? 'You' : selectedChat.name}
                                                            </span>
                                                            {m.replyTo.text}
                                                        </div>
                                                    )}`
    },
    {
        // 10. Message bubble timestamp colors
        old: `                                                    <div className={\`mt-1 text-[10px] \${m.author === 'me' ? 'text-background/80' : 'text-muted-foreground'}\`}>{formatTime(d)}</div>`,
        new: `                                                    <div className={\`mt-1 text-[10px] \${m.author === 'me' ? 'text-white/80' : 'text-muted-foreground'}\`}>{formatTime(d)}</div>`
    },
    {
        // 11. Emoji Picker spinner colors
        old: `                                    {loadingInputEmojis ? (
                                        <div className="flex items-center justify-center py-6">
                                            <div className="w-4 h-4 rounded-full border-2 border-muted border-t-destructive animate-spin" />
                                        </div>
                                    )`,
        new: `                                    {loadingInputEmojis ? (
                                        <div className="flex items-center justify-center py-6">
                                            <div className="w-4 h-4 rounded-full border-2 border-muted border-t-[#e83f55] animate-spin" />
                                        </div>
                                    )`
    },
    {
        // 12. Input reply preview panel left border pink
        old: `                            {replyTarget && (
                                <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted border border-border">`,
        new: `                            {replyTarget && (
                                <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 px-3 py-2 rounded-r-xl rounded-l-md bg-muted border-y border-r border-border border-l-4 border-l-[#e83f55]">`
    },
    {
        // 13. Input container background to bg-white
        old: `                        <div className="p-3 border-t border-border bg-background sticky bottom-0 space-y-2">`,
        new: `                        <div className="p-3 border-t border-border bg-white sticky bottom-0 space-y-2 rounded-b-2xl">`
    },
    {
        // 14. Input action buttons (mic, input, emoji selection, send)
        old: `                                    <button
                                        type="button"
                                        onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                                        className={\`p-2.5 rounded-full hover:bg-muted transition duration-150 cursor-pointer flex-shrink-0 \${
                                            showInputEmojiPicker ? "text-destructive" : "text-muted-foreground"
                                        }\`}
                                        aria-label="Toggle emoji selector"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={\`Message \${selectedChat.name}\`}
                                        className="flex-1 h-11 px-4 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
                                    />
                                    {inputValue.trim() ? (
                                        <Button variant="default" className="h-11 px-4 rounded-full cursor-pointer flex-shrink-0" onClick={handleSend}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="default" className="h-11 px-4 rounded-full bg-destructive text-white hover:bg-destructive/95 cursor-pointer flex-shrink-0" onClick={startRecording} aria-label="Record voice note">
                                            <Mic className="w-4 h-4" />
                                        </Button>
                                    )}`,
        new: `                                    <button
                                        type="button"
                                        onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                                        className={\`p-2.5 rounded-full hover:bg-muted transition duration-150 cursor-pointer flex-shrink-0 \${
                                            showInputEmojiPicker ? "text-[#e83f55]" : "text-muted-foreground"
                                        }\`}
                                        aria-label="Toggle emoji selector"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={\`Message \${selectedChat.name}\`}
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
                                    )}`
    }
];

const normalize = (str) => str.replace(/\r\n/g, '\n').trim();

let updatedCount = 0;
replacements.forEach((rep, index) => {
    const normContent = content.replace(/\r\n/g, '\n');
    const normOld = normalize(rep.old);
    
    if (normContent.includes(normOld)) {
        content = normContent.replace(normOld, rep.new.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
        console.log(`Replacement ${index + 1} succeeded!`);
        updatedCount++;
    } else {
        console.log(`Replacement ${index + 1} failed: target content not found.`);
        // Try searching with slight variations
        const cleanOld = normOld.replace(/\s+/g, ' ');
        // Let's check if we can find a substring
        const snippet = normOld.substring(0, 100);
        console.log(`  Expected snippet search: "${snippet}"`);
        const foundSnippet = normContent.includes(snippet);
        console.log(`  Found start of snippet: ${foundSnippet}`);
    }
});

if (updatedCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Done! Applied ${updatedCount}/${replacements.length} styling replacements.`);
} else {
    console.log('No replacements could be made.');
}
