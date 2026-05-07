"use client"

import { useState, useRef } from "react"
import { Camera, Upload } from "lucide-react"

export default function ProfileUpload() {
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const defaultAvatar = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vb4WJmrW0R3UjJ9YMwAMfeS3fJJDQg.png"

    return (
        <div className="relative group">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                <img 
                    src={preview || defaultAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-90" 
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Upload className="w-6 h-6 text-white" />
                </div>
            </div>

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#e83f55] hover:bg-[#d1374b] rounded-full flex items-center justify-center text-white shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#e83f55] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label="Change profile photo"
            >
                <Camera className="w-5 h-5" />
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload profile picture"
            />

            {/* Loading state (can be implemented with state) */}
            {/* <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div> */}
            
        </div>
    )
}
