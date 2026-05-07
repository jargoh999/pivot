'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, handleApiResponse, tokenStorage } from "@/lib/api";

// Create a motion-wrapped version of Button
const MotionButton = motion(Button);

// Smoke effect component
const SmokeEffect = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 0 }}
        animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 2],
            y: [-20, -40],
        }}
        transition={{
            duration: 1,
            ease: 'easeOut'
        }}
        className="absolute inset-0 bg-gradient-to-t from-gray-200 to-transparent rounded-full pointer-events-none"
    />
);
import Image from "next/image"
import Link from "next/link"

function VerifyOTPContent() {
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [activeDigit, setActiveDigit] = useState<number | null>(null);
    const [showSmoke, setShowSmoke] = useState<number | null>(null);
    const [error, setError] = useState('');
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || 'your email';

    // Handle OTP input change
    const handleChange = (index: number, value: string) => {
        if (value === '' || /^[0-9]$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setActiveDigit(index);

            // Trigger smoke effect
            if (value !== '') {
                setShowSmoke(index);
                setTimeout(() => setShowSmoke(null), 1000);
            }

            // Move to next input if a digit was entered
            if (value !== '' && index < 3) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();
        if (/^\d{4}$/.test(pastedData)) {
            const pastedOtp = pastedData.split('');
            setOtp(pastedOtp);
            handleSubmit(pastedData);
        }
    };

    // Handle form submission
    const handleSubmit = async (otpCode: string) => {
        if (otpCode.length !== 4) {
            setError('Please enter a valid 4-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await handleApiResponse(
                await api.auth.verifyOTP({ email, code: otpCode })
            );

            // Store token and redirect to profile
            tokenStorage.setToken(response.token);
            router.push('/profile');
        } catch (err: any) {
            setError(err.message || 'Invalid verification code. Please try again.');
            // Clear OTP on error
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resend OTP
    const handleResend = async () => {
        if (countdown > 0) return;

        try {
            setIsLoading(true);
            await handleApiResponse(
                await api.auth.resendOTP({ email })
            );

            // Reset countdown
            setCountdown(30);
        } catch (err: any) {
            setError(err.message || 'Failed to resend code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div className="w-full max-w-md p-4 sm:p-6 mx-auto min-h-screen sm:min-h-0 flex flex-col justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
            >
                {/* Logo */}
                <motion.div
                    className="flex justify-center mb-6 sm:mb-8"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Image
                        src="/logo1.png"
                        alt="Logo"
                        width={90}
                        height={90}
                        className="object-contain w-16 h-16 sm:w-20 sm:h-20"
                        priority
                    />
                </motion.div>

                {/* Heading */}
                <motion.h1
                    className="text-2xl font-bold text-center text-[#e83f55] mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    Verify Your Email
                </motion.h1>
                <motion.p
                    className="text-center text-gray-600 mb-6 sm:mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    We've sent a 4-digit code to <span className="font-medium">{email}</span>
                </motion.p>

                {/* OTP Input */}
                <div className="w-full mb-6 sm:mb-8">
                    <motion.div
                        className="flex justify-between space-x-2 sm:space-x-3 mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {[0, 1, 2, 3].map((index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1"
                            >
                                <div className="relative">
                                    <motion.input
                                        ref={useCallback((el: HTMLInputElement | null) => {
                                            inputRefs.current[index] = el;
                                        }, [index])}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={otp[index]}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="relative z-10 w-full h-14 sm:h-16 text-2xl text-center bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e83f55] focus:border-transparent transition-all duration-200"
                                        disabled={isLoading}
                                        autoFocus={index === 0}
                                    />
                                    {otp[index] && (
                                        <motion.div
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-200 to-amber-200 opacity-0"
                                            animate={{
                                                opacity: [0, 0.3, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                repeatType: "loop"
                                            }}
                                        />
                                    )}
                                    <AnimatePresence>
                                        {showSmoke === index && (
                                            <motion.div
                                                className="absolute inset-0 overflow-hidden"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <SmokeEffect />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.p
                                className="text-red-500 text-sm text-center mb-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full"
                    >
                        <MotionButton
                            onClick={() => handleSubmit(otp.join(''))}
                            className="w-full h-14 bg-[#e83f55] hover:bg-[#d62a3f] text-white font-semibold rounded-xl mb-4"
                            disabled={isLoading || otp.some(digit => !digit)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <motion.span
                                        className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Account'
                            )}
                        </MotionButton>
                    </motion.div>

                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-sm text-gray-600">
                            Didn't receive a code?{' '}
                            <motion.button
                                onClick={handleResend}
                                disabled={countdown > 0 || isLoading}
                                className={`font-medium ${countdown > 0 ? 'text-gray-400' : 'text-[#e83f55] hover:underline'}`}
                                whileHover={countdown === 0 && !isLoading ? { scale: 1.05 } : {}}
                                whileTap={countdown === 0 && !isLoading ? { scale: 0.95 } : {}}
                            >
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                            </motion.button>
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-xs text-gray-500">
                        By verifying your email, you agree to our{' '}
                        <Link href="/terms" className="text-[#e83f55] hover:underline transition-colors duration-200">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-[#e83f55] hover:underline transition-colors duration-200">
                            Privacy Policy
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function VerifyOTP() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md p-4 sm:p-6 mx-auto min-h-screen sm:min-h-0 flex flex-col justify-center items-center">
                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-[#e83f55] rounded-full"></div>
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    );
}
