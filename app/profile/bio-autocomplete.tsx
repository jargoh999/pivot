"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface Suggestion {
  word: string
  score: number
}

interface BioAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  rows?: number
}

export default function BioAutocomplete({
  value,
  onChange,
  placeholder = "Tell us a bit about yourself...",
  maxLength = 500,
  rows = 3,
}: BioAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Get the current word being typed (last 1-2 words for context)
  const getCurrentContext = useCallback((text: string, cursor: number): { word: string; prefix: string } | null => {
    const beforeCursor = text.slice(0, cursor)
    const words = beforeCursor.split(/\s+/)

    // Get last 2 words for context, or just last word
    const lastWord = words[words.length - 1]
    const prevWord = words.length > 1 ? words[words.length - 2] : ""

    // Only suggest if the last word is at least 2 chars and no punctuation at end
    if (lastWord.length < 2 || /[.!?;,]$/.test(lastWord)) return null

    return {
      word: lastWord.toLowerCase(),
      prefix: prevWord.toLowerCase(),
    }
  }, [])

  // Fetch suggestions from Datamuse API
  const fetchSuggestions = useCallback(async (context: { word: string; prefix: string }) => {
    try {
      // Use Datamuse API - free, no API key needed
      // ml = means like (synonyms/similar)
      // sl = sounds like
      // sp = spelled like
      const query = context.prefix
        ? `https://api.datamuse.com/words?ml=${encodeURIComponent(context.word)}&max=5`
        : `https://api.datamuse.com/sug?s=${encodeURIComponent(context.word)}&max=5`

      const response = await fetch(query)
      if (!response.ok) return

      const data: Suggestion[] = await response.json()

      // Filter out the exact word being typed
      const filtered = data.filter(s => s.word.toLowerCase() !== context.word)

      if (filtered.length > 0) {
        setSuggestions(filtered.slice(0, 5))
        setShowSuggestions(true)
        setSelectedIndex(0)
      } else {
        setShowSuggestions(false)
      }
    } catch {
      setShowSuggestions(false)
    }
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const newCursor = e.target.selectionStart

    onChange(newValue)
    setCursorPosition(newCursor)

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    const context = getCurrentContext(newValue, newCursor)

    if (context) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(context)
      }, 150) // 150ms debounce
    } else {
      setShowSuggestions(false)
    }
  }, [onChange, getCurrentContext, fetchSuggestions])

  const insertSuggestion = useCallback((suggestion: string) => {
    const beforeCursor = value.slice(0, cursorPosition)
    const afterCursor = value.slice(cursorPosition)

    // Find the word boundary
    const words = beforeCursor.split(/\s+/)
    const lastWord = words[words.length - 1]
    const beforeLastWord = beforeCursor.slice(0, beforeCursor.length - lastWord.length)

    const newValue = beforeLastWord + suggestion + " " + afterCursor
    const newCursorPosition = beforeLastWord.length + suggestion.length + 1

    onChange(newValue)
    setShowSuggestions(false)

    // Restore cursor position after render
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
      textareaRef.current?.focus()
    }, 0)
  }, [value, cursorPosition, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case "Tab":
      case "Enter":
        e.preventDefault()
        if (suggestions[selectedIndex]) {
          insertSuggestion(suggestions[selectedIndex].word)
        }
        break
      case "Escape":
        setShowSuggestions(false)
        break
    }
  }, [showSuggestions, suggestions, selectedIndex, insertSuggestion])

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e83f55] focus:border-[#e83f55] outline-none transition-all resize-none"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.word}
              type="button"
              onClick={() => insertSuggestion(suggestion.word)}
              onTouchStart={(e) => {
                e.preventDefault()
                insertSuggestion(suggestion.word)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${index === selectedIndex
                  ? "bg-[#e83f55]/10 text-[#e83f55]"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              <span className="font-medium">{suggestion.word}</span>
              {suggestion.score && (
                <span className="ml-2 text-xs text-gray-400">
                  ({Math.round(suggestion.score * 100)}% match)
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right mt-1">{value.length}/{maxLength}</p>
    </div>
  )
}
