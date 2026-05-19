const fs = require('fs');
const filePath = 'c:\\Users\\DELL\\Downloads\\vibe-chat\\app\\chat\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add updateSidebarWithNewMessage helper
const getUserIdFromTokenEnd = `        } catch (e) {
            return null
        }
    }`;

const insertHelper = `        } catch (e) {
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
    }`;

const normalizedContent = content.replace(/\r\n/g, '\n');
const normGetUserId = getUserIdFromTokenEnd.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normGetUserId)) {
    content = normalizedContent.replace(normGetUserId, insertHelper.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
    console.log('Inserted helper function successfully!');
} else {
    console.log('Could not find getUserIdFromTokenEnd in content.');
}

// 2. Add to handleSendImage
const handleSendImageTarget = `        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))`;
const handleSendImageReplacement = `        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))
        updateSidebarWithNewMessage(selectedChat.id, "You: 📷 Photo", optimisticMsg.timestamp)`;

const normHandleSendImageTarget = handleSendImageTarget.replace(/\r\n/g, '\n');
content = content.replace(/\r\n/g, '\n');
if (content.includes(normHandleSendImageTarget)) {
    content = content.replace(normHandleSendImageTarget, handleSendImageReplacement.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
    console.log('Updated handleSendImage successfully!');
} else {
    console.log('Could not find handleSendImage target.');
}

// 3. Add to handleSendVoiceNote
const handleSendVoiceNoteTarget = `        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))`;
// Note: handleSendVoiceNoteTarget is the same text as handleSendImageTarget, so simple replace might hit the first one twice if we're not careful.
// Let's do a more specific query for voice note.
const handleSendVoiceNoteSpecific = `        // Optimistic UI update
        const optimisticMsg: ChatMessage = {
            id: \`temp-\${Date.now()}\`,
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
        }))`;

const handleSendVoiceNoteReplacement = `        // Optimistic UI update
        const optimisticMsg: ChatMessage = {
            id: \`temp-\${Date.now()}\`,
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
        updateSidebarWithNewMessage(selectedChat.id, "You: 🎤 Voice Note", optimisticMsg.timestamp)`;

content = content.replace(/\r\n/g, '\n');
const normVoiceNote = handleSendVoiceNoteSpecific.replace(/\r\n/g, '\n');
if (content.includes(normVoiceNote)) {
    content = content.replace(normVoiceNote, handleSendVoiceNoteReplacement.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
    console.log('Updated handleSendVoiceNote successfully!');
} else {
    console.log('Could not find handleSendVoiceNote target.');
}

// 4. Add to handleSend
const handleSendSpecific = `        // Optimistic UI update
        const optimisticMsg: ChatMessage = {
            id: \`temp-\${Date.now()}\`,
            author: "me",
            text,
            timestamp: new Date().toISOString(),
            replyTo: replyTarget ? { id: replyTarget.id, text: replyTarget.text, author: replyTarget.author } : undefined,
        }

        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))`;

const handleSendReplacement = `        // Optimistic UI update
        const optimisticMsg: ChatMessage = {
            id: \`temp-\${Date.now()}\`,
            author: "me",
            text,
            timestamp: new Date().toISOString(),
            replyTo: replyTarget ? { id: replyTarget.id, text: replyTarget.text, author: replyTarget.author } : undefined,
        }

        setConversations((prev) => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMsg],
        }))
        updateSidebarWithNewMessage(selectedChat.id, "You: " + text, optimisticMsg.timestamp)`;

content = content.replace(/\r\n/g, '\n');
const normHandleSend = handleSendSpecific.replace(/\r\n/g, '\n');
if (content.includes(normHandleSend)) {
    content = content.replace(normHandleSend, handleSendReplacement.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
    console.log('Updated handleSend successfully!');
} else {
    console.log('Could not find handleSend target.');
}

// 5. Add to SSE onmessage
const sseTarget = `                if (data.type === 'new_message') {
                    const newMsg = data.data`;

const sseReplacement = `                if (data.type === 'new_message') {
                    const newMsg = data.data
                    updateSidebarWithNewMessage(selectedChat.id, (newMsg.author === 'me' ? 'You: ' : '') + newMsg.text, newMsg.timestamp)`;

content = content.replace(/\r\n/g, '\n');
const normSse = sseTarget.replace(/\r\n/g, '\n');
if (content.includes(normSse)) {
    content = content.replace(normSse, sseReplacement.replace(/\r\n/g, '\n')).replace(/\n/g, '\r\n');
    console.log('Updated SSE successfully!');
} else {
    console.log('Could not find SSE target.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done all changes!');
