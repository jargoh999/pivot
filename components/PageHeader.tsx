"use client"

import { ChevronLeft, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: string
    subtitle?: string
    showBackButton?: boolean
    showSettingsButton?: boolean
    onBack?: () => void
    onSettings?: () => void
    rightContent?: React.ReactNode
}

export default function PageHeader({
    title,
    subtitle,
    showBackButton = true,
    showSettingsButton = false,
    onBack,
    onSettings,
    rightContent
}: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 md:p-6 bg-white border-b border-gray-100">
            <div className="flex items-center gap-4">
                {showBackButton && (
                    <Button
                        onClick={onBack}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors"
                        variant="ghost"
                    >
                        <ChevronLeft className="w-5 h-5 text-foreground" />
                    </Button>
                )}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-sm font-medium text-foreground/90 mt-1">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {rightContent}
                {showSettingsButton && (
                    <Button
                        onClick={onSettings}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors"
                        variant="ghost"
                    >
                        <Settings2 className="w-5 h-5 text-destructive" />
                    </Button>
                )}
            </div>
        </div>
    )
}
