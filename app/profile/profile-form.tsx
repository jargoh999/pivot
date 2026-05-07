"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react"
import { ReactNode } from "react"
import ProfileUpload from "./profile-upload"
import DatePicker, { ReactDatePickerCustomHeaderProps } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./profile-styles.css"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { api, handleApiResponse, tokenStorage } from "@/lib/api"

export default function ProfileForm() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [birthDate, setBirthDate] = useState<Date | null>(null)
    const [showCalendar, setShowCalendar] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        // Load existing profile data
        const loadProfile = async () => {
            try {
                const token = tokenStorage.getToken()
                if (!token) {
                    router.push('/login')
                    return
                }

                const response = await handleApiResponse(
                    await api.profile.get(token)
                )

                setFirstName(response.user.firstName || "")
                setLastName(response.user.lastName || "")
                if (response.user.birthDate) {
                    setBirthDate(new Date(response.user.birthDate))
                }
            } catch (err: any) {
                console.error('Failed to load profile:', err)
                // Don't show error on initial load, just log it
            }
        }

        loadProfile()
    }, [router])

    const handleConfirm = async () => {
        if (!firstName || !lastName) {
            setError("First name and last name are required")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const token = tokenStorage.getToken()
            if (!token) {
                router.push('/login')
                return
            }

            const updateData: any = { firstName, lastName }
            if (birthDate) {
                updateData.birthDate = birthDate.toISOString()
            }

            await handleApiResponse(
                await api.profile.update(token, updateData)
            )

            // Redirect to discover or dashboard after profile completion
            router.push('/discover')
        } catch (err: any) {
            setError(err.message || "Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSkip = () => {
        // Skip profile setup and go to discover
        router.push('/discover')
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Details</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Complete your profile to get started
                    </p>
                </div>
                <button
                    onClick={handleSkip}
                    className="text-sm font-medium text-[#e83f55] dark:text-[#e83f55] hover:text-[#d1374b] dark:hover:text-[#f05a6d] transition-colors"
                >
                    Skip for now
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="flex flex-col items-center mb-8">
                <ProfileUpload />
                <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                    Click on the camera to upload a profile photo
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name
                    </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e83f55] focus:border-[#e83f55] outline-none transition-all"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name
                    </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e83f55] focus:border-[#e83f55] outline-none transition-all"
                    />
                </div>

                <div className="pt-2 relative">
                    <div
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`w-full flex items-center justify-between p-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 cursor-pointer border ${showCalendar ? 'border-[#e83f55]/30' : 'border-transparent'}`}
                    >
                        <div className="flex items-center">
                            <div className="p-2 bg-[#e83f55]/10 dark:bg-[#e83f55]/30 rounded-lg mr-3">
                                <CalendarIcon className="w-5 h-5 text-[#e83f55] dark:text-[#e83f55]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Date of Birth</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {birthDate ? format(birthDate, 'MMMM d, yyyy') : "Select your birthday"}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showCalendar ? 'rotate-90' : ''}`} />
                    </div>

                    <div className={`absolute bottom-full left-0 w-full mb-2 z-10 transition-all duration-300 transform origin-bottom ${showCalendar ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                            <DatePicker
                                selected={birthDate}
                                onChange={(date: Date | null) => {
                                    setBirthDate(date);
                                    setShowCalendar(false);
                                }}
                                dateFormat="MMMM d, yyyy"
                                maxDate={new Date()}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                inline
                                className="border-0"
                                renderCustomHeader={({
                                    date,
                                    decreaseMonth,
                                    increaseMonth,
                                    prevMonthButtonDisabled,
                                    nextMonthButtonDisabled,
                                }: ReactDatePickerCustomHeaderProps) => (
                                    <div className="flex items-center justify-between px-2 py-2">
                                        <button
                                            onClick={decreaseMonth}
                                            disabled={prevMonthButtonDisabled}
                                            type="button"
                                            className={`p-1 rounded-full ${prevMonthButtonDisabled ? 'text-gray-400' : 'text-[#e83f55] hover:bg-[#e83f55]/10'}`}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {format(date, 'MMMM yyyy')}
                                        </div>
                                        <button
                                            onClick={increaseMonth}
                                            disabled={nextMonthButtonDisabled}
                                            type="button"
                                            className={`p-1 rounded-full ${nextMonthButtonDisabled ? 'text-gray-400' : 'text-[#e83f55] hover:bg-[#e83f55]/10'}`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                renderDayContents={(day: number, date: Date): ReactNode => {
                                    const isSelected = date && birthDate && date.toDateString() === birthDate.toDateString();
                                    const isToday = date && new Date().toDateString() === date.toDateString();

                                    return (
                                        <div className="day-wrapper">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200
                                                ${date && isSelected
                                                    ? 'bg-[#e83f55] text-white'
                                                    : isToday && date
                                                        ? 'text-[#e83f55] font-semibold'
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                {day}
                                            </span>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleConfirm}
                    disabled={!firstName || !lastName || isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#e83f55] hover:bg-[#d1374b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                    {isLoading ? 'Saving...' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
