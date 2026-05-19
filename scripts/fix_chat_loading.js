const fs = require('fs');
const filePath = 'c:\\Users\\DELL\\Downloads\\vibe-chat\\app\\chat\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = '                        <div className="px-4 py-3 space-y-3 h-[65vh] sm:h-[60vh] overflow-y-auto">';
const targetIndex = content.indexOf(targetStr);
console.log('Found index of target container:', targetIndex);

if (targetIndex !== -1) {
    const endStr = '<div ref={scrollBottomRef} />';
    const endIndex = content.indexOf(endStr, targetIndex);
    console.log('Found index of scroll bottom ref:', endIndex);
    if (endIndex !== -1) {
        const fullOldSnippet = content.substring(targetIndex, endIndex + endStr.length);
        console.log('Snippet length:', fullOldSnippet.length);

        const newSnippet = `                        <div className="px-4 py-3 space-y-3 h-[65vh] sm:h-[60vh] overflow-y-auto">
                            {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-3">
                                    <div className="w-8 h-8 rounded-full border-4 border-muted border-t-destructive animate-spin" />
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
                                                <div key={\`hdr-\${m.id}\`} className="flex items-center gap-3 py-2">
                                                    <div className="h-px flex-1 bg-border" />
                                                    <span className="text-xs text-muted-foreground">{formatDayHeader(d)}</span>
                                                    <div className="h-px flex-1 bg-border" />
                                                </div>
                                            )
                                        }
                                        acc.el.push(
                                            <div key={m.id} className={\`flex \${m.author === 'me' ? 'justify-end' : 'justify-start'} mb-2\`}>
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
                                                    <div className={\`mt-1 text-[10px] \${m.author === 'me' ? 'text-background/80' : 'text-muted-foreground'}\`}>{formatTime(d)}</div>

                                                    {/* Reaction Badges */}
                                                    {m.reactions && m.reactions.length > 0 && (
                                                        <div className={\`absolute -bottom-2 \${m.author === 'me' ? 'left-2' : 'right-2'} flex gap-0.5 z-10\`}>
                                                            {Array.from(new Set(m.reactions.map(r => r.emoji))).map((emoji, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className="w-5 h-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-xs hover:scale-110 transition cursor-pointer"
                                                                    title={\`\${m.reactions?.filter(r => r.emoji === emoji).length} reaction(s)\`}
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
                            <div ref={scrollBottomRef} />`;

        content = content.replace(fullOldSnippet, newSnippet);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully updated page.tsx with chat messages loading screen!');
    }
}
