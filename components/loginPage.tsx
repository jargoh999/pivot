"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function SignupForm() {
    const [email, setEmail] = useState("")
    const [showEmailForm, setShowEmailForm] = useState(false)

    return (
        <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-12">
                <Image 
                    src="/logo1.png" 
                    alt="Logo" 
                    width={80} 
                    height={80}
                    className="object-contain"
                />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center text-foreground mb-8">Sign up to continue</h1>

            {!showEmailForm ? (
                <>
                    {/* Email Button */}
                    <Button
                        onClick={() => setShowEmailForm(true)}
                        className="w-full h-14 bg-[#E63946] hover:bg-[#D62828] text-white font-semibold rounded-xl mb-4 text-base"
                    >
                        Continue with email
                    </Button>

                    {/* Phone Link */}
                    <button onClick={() => { }} className="w-full text-center text-[#E63946] font-semibold mb-8 hover:underline">
                        Use phone number
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-muted-foreground text-sm">or sign up with</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Google Login */}
                    <div className="flex justify-center mb-10">
                        <Button
                            variant="outline"
                            className="w-full h-14 flex items-center justify-center gap-2 border-border rounded-xl"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    {/* Email Input Form */}
                    <div className="mb-6">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 px-4 border border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                        />
                    </div>

                    <Button
                        onClick={() => { }}
                        className="w-full h-14 bg-[#E63946] hover:bg-[#D62828] text-white font-semibold rounded-xl mb-4"
                    >
                        Continue
                    </Button>

                    <Button
                        onClick={() => setShowEmailForm(false)}
                        variant="outline"
                        className="w-full h-14 text-foreground rounded-xl font-semibold"
                    >
                        Back
                    </Button>
                </>
            )}

            {/* Footer */}
            <div className="flex justify-center gap-6 mt-12 text-sm">
                <a href="#" className="text-[#E63946] hover:underline">
                    Terms of use
                </a>
                <a href="#" className="text-[#E63946] hover:underline">
                    Privacy Policy
                </a>
            </div>
        </div>
    )
}
