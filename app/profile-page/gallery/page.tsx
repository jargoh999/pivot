"use client"

import { X, Compass, Heart, MessageSquareHeart, Merge } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function GalleryPage() {
  const images: string[] = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=800&q=80",
    "https://images.unsplash.com/photo-1516987723245-1bcda002c1d6?w=800&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=800&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
    "https://images.unsplash.com/photo-1516987723245-1bcda002c1d6?w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
  ]

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const show = activeIndex !== null

  const close = () => setActiveIndex(null)
  const prev = () => setActiveIndex((i) => (i === null ? i : (i + images.length - 1) % images.length))
  const next = () => setActiveIndex((i) => (i === null ? i : (i + 1) % images.length))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/profile-page" className="p-2 -ml-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base sm:text-lg font-semibold text-foreground">Gallery</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <img src={src || "/placeholder.svg"} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <div className={`fixed inset-0 z-50 ${show ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={close}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${show ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Image viewer */}
        <div className={`absolute inset-0 flex items-center justify-center px-4 transition-transform duration-200 ease-out ${show ? 'scale-100' : 'scale-95 translate-y-4'}`}>
          {show && (
            <div className="relative max-w-full w-full sm:max-w-2xl">
              <div className="relative rounded-2xl overflow-hidden bg-black/10">
                <img src={images[activeIndex!]} alt="Active" className="w-full h-auto max-h-[75vh] object-contain" />
                {/* Controls */}
                <button
                  onClick={close}
                  aria-label="Close"
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/60 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 select-none">
                  <button onClick={prev} aria-label="Previous" className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white">
                    ‹
                  </button>
                  <button onClick={next} aria-label="Next" className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white">
                    ›
                  </button>
                </div>
              </div>
              {/* Thumbnails */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={`thumb-${i}`}
                    onClick={() => setActiveIndex(i)}
                    className={`h-14 w-14 rounded-lg overflow-hidden flex-shrink-0 border ${i === activeIndex ? 'border-white' : 'border-border'}`}
                  >
                    <img src={src} alt={`Thumb ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Bottom Navigation */}
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
