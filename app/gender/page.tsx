"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Check, ChevronDown } from "lucide-react"

export default function GenderSelection() {
    const [selectedGender, setSelectedGender] = useState("Man")
    const [showMoreOptions, setShowMoreOptions] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const genderOptions = [
        { id: "woman", label: "Woman" },
        { id: "man", label: "Man" },
    ]

    const additionalGenderOptions = [
        { id: "non-binary", label: "Non-binary" },
        { id: "genderqueer", label: "Genderqueer" },
        { id: "genderfluid", label: "Genderfluid" },
        { id: "agender", label: "Agender" },
        { id: "two-spirit", label: "Two-Spirit" },
        { id: "other", label: "Other" },
        { id: "prefer-not-to-say", label: "Prefer not to say" },
    ]

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowMoreOptions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors">
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button className="text-sm font-medium text-[#EF4444] hover:text-red-600 transition-colors">Skip</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-between px-6 py-12">
                {/* Heading */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-8">I am a</h1>

                    {/* Gender Options */}
                    <div className="space-y-3">
                        {genderOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setSelectedGender(option.label)}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${selectedGender === option.label
                                        ? "bg-[#EF4444] border-[#EF4444] text-white"
                                        : "bg-background border-border text-foreground hover:border-foreground"
                                    }`}
                            >
                                <span className="font-medium">{option.label}</span>
                                <Check className="w-5 h-5" />
                            </button>
                        ))}

                        {/* Choose Another Button with Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setShowMoreOptions(!showMoreOptions)}
                                className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 border-border text-foreground hover:border-foreground transition-colors"
                            >
                                <span className="font-medium">Choose another</span>
                                <div className="flex items-center">
                                    <ChevronDown className={`w-5 h-5 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            
                            {showMoreOptions && (
                                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-2xl shadow-lg overflow-hidden">
                                    {additionalGenderOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSelectedGender(option.label)
                                                setShowMoreOptions(false)
                                            }}
                                            className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted transition-colors ${
                                                selectedGender === option.label ? 'text-[#EF4444]' : 'text-foreground'
                                            }`}
                                        >
                                            <span className="font-medium">{option.label}</span>
                                            {selectedGender === option.label && <Check className="w-5 h-5" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Continue Button */}
                <button className="w-full bg-[#EF4444] hover:bg-red-600 text-white font-semibold py-4 rounded-2xl transition-colors">
                    Continue
                </button>
            </div>
        </div>
    )
}
