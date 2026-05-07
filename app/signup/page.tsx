"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api, handleApiResponse, tokenStorage } from "@/lib/api"

export default function SignupForm() {
    const [email, setEmail] = useState("")
    const [fullName, setFullName] = useState("")
    const [password, setPassword] = useState("")
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSignup = async () => {
        console.log('Signup button clicked', { fullName, email, password: '***' })

        if (!fullName || !email || !password) {
            setError("All fields are required")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            console.log('Calling register API with:', {
                email: email || 'MISSING',
                password: password ? '***' : 'MISSING',
                fullName: fullName || 'MISSING'
            })

            const apiResponse = await api.auth.register({ email, password, fullName })
            console.log('API response received:', apiResponse)

            const response = await handleApiResponse(apiResponse)
            console.log('Processed response:', response)

            // Store token
            tokenStorage.setToken(response.token)

            // Redirect to OTP verification
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
        } catch (err: any) {
            console.error('Signup error:', err)
            setError(err.message || "Failed to create account")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 sm:p-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
                <Image
                    src="/logo1.png"
                    alt="Logo"
                    width={90}
                    height={90}
                    className="object-contain"
                />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-center text-[#e83f55] mb-8">Create an account</h1>

            {!showEmailForm ? (
                <>
                    {/* Email Button */}
                    <Button
                        onClick={() => setShowEmailForm(true)}
                        className="w-full h-14 bg-[#e83f55] hover:bg-[#d62a3f] text-white font-semibold rounded-xl mb-4 text-base"
                    >
                        Continue with email
                    </Button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-gray-500 text-sm">or sign up with</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google Login */}
                    <div className="flex justify-center mb-6">
                        <Button
                            variant="outline"
                            className="w-full h-14 flex items-center justify-center gap-2 border-gray-300 rounded-xl hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>
                    </div>

                    {/* Sign In Link */}
                    <p className="text-center text-gray-600 text-sm">
                        Already have an account?{" "}
                        <button
                            onClick={() => router.push('/login')}
                            className="text-[#e83f55] font-semibold hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </>
            ) : (
                <>
                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Email Input Form */}
                    <div className="space-y-4 mb-6 px-2 sm:px-0">
                        <div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e83f55] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e83f55] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e83f55] focus:border-transparent"
                            />
                            <p className="mt-2 text-xs text-gray-500">Use 6 or more characters</p>
                            <p className="mt-2 text-xs text-gray-500">
                                A verification code will be sent to your email after signup to verify your account.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSignup}
                        disabled={isLoading}
                        className="w-full h-14 bg-[#e83f55] hover:bg-[#d62a3f] text-white font-semibold rounded-xl mb-4"
                    >
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mb-6">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="text-[#e83f55] hover:underline">Terms of Service</Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-[#e83f55] hover:underline">Privacy Policy</Link>.
                    </p>

                    <Button
                        onClick={() => setShowEmailForm(false)}
                        variant="outline"
                        className="w-full h-14 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                    >
                        Back
                    </Button>
                </>
            )}
        </div>
    )
}
