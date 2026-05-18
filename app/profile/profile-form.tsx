"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar as CalendarIcon, ArrowRight, ChevronRight, ChevronLeft, X, Check, ChevronDown } from "lucide-react"
import { ReactNode } from "react"
import ProfileUpload from "./profile-upload"
import BioAutocomplete from "./bio-autocomplete"
import DatePicker, { ReactDatePickerCustomHeaderProps } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./profile-styles.css"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { api, handleApiResponse, tokenStorage, EnumOption, EnumsResponse } from "@/lib/api"

interface DropdownProps {
    label: string
    value: string
    options: EnumOption[]
    onChange: (value: string) => void
    placeholder?: string
    icon?: React.ReactNode
}

function SingleSelectDropdown({ label, value, options, onChange, placeholder, icon }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const selectedLabel = options.find(opt => opt.value === value)?.label

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e83f55] focus:border-[#e83f55] outline-none transition-all"
            >
                <div className="flex items-center">
                    {icon && <span className="mr-2">{icon}</span>}
                    <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                        {selectedLabel || placeholder || `Select ${label}`}
                    </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${value === option.value ? "bg-[#e83f55]/10 text-[#e83f55]" : "text-gray-700 dark:text-gray-200"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

interface MultiSelectProps extends Omit<DropdownProps, "value" | "onChange"> {
    values: string[]
    onChange: (values: string[]) => void
    maxSelections?: number
}

function MultiSelectDropdown({ label, values, options, onChange, placeholder, icon, maxSelections }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOptions = options.filter(opt => values.includes(opt.value))

    const toggleValue = (value: string) => {
        if (values.includes(value)) {
            onChange(values.filter(v => v !== value))
        } else if (!maxSelections || values.length < maxSelections) {
            onChange([...values, value])
        }
    }

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {maxSelections && <span className="text-xs text-gray-400">(max {maxSelections})</span>}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#e83f55] focus:border-[#e83f55] outline-none transition-all"
            >
                <div className="flex items-center flex-wrap gap-1">
                    {icon && <span className="mr-2">{icon}</span>}
                    {selectedOptions.length === 0 ? (
                        <span className="text-gray-400">{placeholder || `Select ${label}`}</span>
                    ) : (
                        selectedOptions.map(opt => (
                            <span key={opt.value} className="inline-flex items-center px-2 py-1 bg-[#e83f55]/10 text-[#e83f55] text-xs rounded-full">
                                {opt.label}
                                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleValue(opt.value); }} />
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {options.map((option) => {
                            const isSelected = values.includes(option.value)
                            const isDisabled = Boolean(!isSelected && maxSelections && values.length >= maxSelections)
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => !isDisabled && toggleValue(option.value)}
                                    disabled={isDisabled}
                                    className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                                        } ${isSelected ? "bg-[#e83f55]/10 text-[#e83f55]" : "text-gray-700 dark:text-gray-200"}`}
                                >
                                    <span>{option.label}</span>
                                    {isSelected && <Check className="w-4 h-4" />}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default function ProfileForm() {
    const [birthDate, setBirthDate] = useState<Date | null>(null)
    const [showCalendar, setShowCalendar] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [profilePhoto, setProfilePhoto] = useState("")

    // New dropdown states
    const [enums, setEnums] = useState<EnumsResponse | null>(null)
    const [gender, setGender] = useState("")
    const [country, setCountry] = useState("")
    const [industry, setIndustry] = useState("")
    const [experienceLevel, setExperienceLevel] = useState("")
    const [interests, setInterests] = useState<string[]>([])
    const [intentions, setIntentions] = useState<string[]>([])
    const [languages, setLanguages] = useState<string[]>([])
    const [bio, setBio] = useState("")

    const router = useRouter()

    // Load enums
    useEffect(() => {
        const loadEnums = async () => {
            try {
                const response = await api.enums.get()
                if (response.enums) {
                    setEnums(response.enums)
                }
            } catch (err) {
                console.error('Failed to load enums:', err)
            }
        }
        loadEnums()
    }, [])

    // Load existing profile data
    useEffect(() => {
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

                setProfilePhoto(response.user.profilePhoto || "")
                if (response.user.birthDate) {
                    setBirthDate(new Date(response.user.birthDate))
                }
                // Load new fields
                setGender(response.user.gender || "")
                setCountry(response.user.country || "")
                setIndustry(response.user.industry || "")
                setExperienceLevel(response.user.experienceLevel || "")
                setInterests(response.user.interests || [])
                setIntentions(response.user.intentions || [])
                setLanguages(response.user.languages || [])
                setBio(response.user.bio || "")
            } catch (err: any) {
                console.error('Failed to load profile:', err)
            }
        }

        loadProfile()
    }, [router])

    const handlePhotoUpload = useCallback(async (file: File) => {
        try {
            const token = tokenStorage.getToken()
            if (!token) return

            const response = await api.profile.uploadPhoto(token, file)
            if (response.profilePhoto) {
                setProfilePhoto(response.profilePhoto)
            }
        } catch (err: any) {
            console.error('Failed to upload photo:', err)
            setError('Failed to upload photo: ' + (err.message || 'Unknown error'))
        }
    }, [])

    const handleConfirm = async () => {
        setIsLoading(true)
        setError("")

        try {
            const token = tokenStorage.getToken()
            if (!token) {
                router.push('/login')
                return
            }

            const updateData: any = {
                gender,
                country,
                industry,
                experienceLevel,
                interests,
                intentions,
                languages,
                bio,
            }
            if (birthDate) {
                updateData.birthDate = birthDate.toISOString()
            }
            if (profilePhoto) {
                updateData.profilePhoto = profilePhoto
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
                <ProfileUpload currentPhoto={profilePhoto} onPhotoUpload={handlePhotoUpload} />
                <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
                    Click on the camera to upload a profile photo
                </p>
            </div>

            <div className="space-y-4">
                {/* Dropdown Fields */}
                {enums && (
                    <>
                        <SingleSelectDropdown
                            label="Gender"
                            value={gender}
                            options={enums.gender}
                            onChange={setGender}
                            placeholder="Select gender"
                        />

                        <SingleSelectDropdown
                            label="Country"
                            value={country}
                            options={[
                                { value: 'us', label: 'United States' },
                                { value: 'uk', label: 'United Kingdom' },
                                { value: 'ca', label: 'Canada' },
                                { value: 'au', label: 'Australia' },
                                { value: 'de', label: 'Germany' },
                                { value: 'fr', label: 'France' },
                                { value: 'es', label: 'Spain' },
                                { value: 'it', label: 'Italy' },
                                { value: 'nl', label: 'Netherlands' },
                                { value: 'se', label: 'Sweden' },
                                { value: 'no', label: 'Norway' },
                                { value: 'dk', label: 'Denmark' },
                                { value: 'fi', label: 'Finland' },
                                { value: 'jp', label: 'Japan' },
                                { value: 'kr', label: 'South Korea' },
                                { value: 'cn', label: 'China' },
                                { value: 'in', label: 'India' },
                                { value: 'br', label: 'Brazil' },
                                { value: 'mx', label: 'Mexico' },
                                { value: 'za', label: 'South Africa' },
                                { value: 'ng', label: 'Nigeria' },
                                { value: 'ke', label: 'Kenya' },
                                { value: 'gh', label: 'Ghana' },
                                { value: 'eg', label: 'Egypt' },
                                { value: 'ae', label: 'UAE' },
                                { value: 'sa', label: 'Saudi Arabia' },
                                { value: 'tr', label: 'Turkey' },
                                { value: 'sg', label: 'Singapore' },
                                { value: 'my', label: 'Malaysia' },
                                { value: 'id', label: 'Indonesia' },
                                { value: 'th', label: 'Thailand' },
                                { value: 'ph', label: 'Philippines' },
                                { value: 'vn', label: 'Vietnam' },
                                { value: 'other', label: 'Other' },
                            ]}
                            onChange={setCountry}
                            placeholder="Select your country"
                        />

                        <SingleSelectDropdown
                            label="Industry"
                            value={industry}
                            options={enums.industries}
                            onChange={setIndustry}
                            placeholder="Select your industry"
                        />

                        <SingleSelectDropdown
                            label="Experience Level"
                            value={experienceLevel}
                            options={enums.experienceLevel}
                            onChange={setExperienceLevel}
                            placeholder="Select experience level"
                        />

                        <MultiSelectDropdown
                            label="Interests"
                            values={interests}
                            options={enums.interests}
                            onChange={setInterests}
                            placeholder="Select your interests"
                            maxSelections={5}
                        />

                        <MultiSelectDropdown
                            label="Looking For"
                            values={intentions}
                            options={enums.intentions}
                            onChange={setIntentions}
                            placeholder="What are you looking for?"
                            maxSelections={3}
                        />

                        <MultiSelectDropdown
                            label="Languages"
                            values={languages}
                            options={enums.languages}
                            onChange={setLanguages}
                            placeholder="Select languages you speak"
                            maxSelections={5}
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Bio
                            </label>
                            <BioAutocomplete
                                value={bio}
                                onChange={setBio}
                                placeholder="Tell us a bit about yourself..."
                                maxLength={500}
                                rows={3}
                            />
                        </div>
                    </>
                )}

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

                    <div className={`absolute bottom-full left-0 w-full mb-2 z-[60] transition-all duration-300 transform origin-bottom ${showCalendar ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
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
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#e83f55] hover:bg-[#d1374b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                    {isLoading ? 'Saving...' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
