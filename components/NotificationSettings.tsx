'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Moon, Sun, MessageSquareHeart, Heart, Eye, Settings } from 'lucide-react';
import {
    getNotificationPreferences,
    setNotificationPreferences,
    NotificationPreferences,
    defaultNotificationPreferences
} from '@/lib/notifications';

export default function NotificationSettings() {
    const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setPreferences(getNotificationPreferences());
    }, []);

    const handleToggle = (key: keyof NotificationPreferences) => {
        if (typeof preferences[key] === 'boolean') {
            const updated = { ...preferences, [key]: !preferences[key] };
            setPreferences(updated);
            setNotificationPreferences(updated);
        }
    };

    const handleQuietHoursToggle = (enabled: boolean) => {
        const updated = {
            ...preferences,
            quietHours: {
                ...preferences.quietHours,
                enabled
            }
        };
        setPreferences(updated);
        setNotificationPreferences(updated);
    };

    const handleQuietHoursTime = (field: 'start' | 'end', value: string) => {
        const updated = {
            ...preferences,
            quietHours: {
                ...preferences.quietHours,
                [field]: value
            }
        };
        setPreferences(updated);
        setNotificationPreferences(updated);
    };

    const resetToDefaults = () => {
        setPreferences(defaultNotificationPreferences);
        setNotificationPreferences(defaultNotificationPreferences);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Message Notifications */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquareHeart className="w-5 h-5 text-blue-500" />
                            <div>
                                <Label htmlFor="messages" className="font-medium">Messages</Label>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when you receive new messages
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="messages"
                            checked={preferences.messages}
                            onCheckedChange={() => handleToggle('messages')}
                        />
                    </div>

                    {/* Match Notifications */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-red-500" />
                            <div>
                                <Label htmlFor="matches" className="font-medium">Matches</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notifications for new matches and likes
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="matches"
                            checked={preferences.matches}
                            onCheckedChange={() => handleToggle('matches')}
                        />
                    </div>

                    {/* Like Notifications */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-pink-500" />
                            <div>
                                <Label htmlFor="likes" className="font-medium">Likes</Label>
                                <p className="text-sm text-muted-foreground">
                                    When someone likes your profile
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="likes"
                            checked={preferences.likes}
                            onCheckedChange={() => handleToggle('likes')}
                        />
                    </div>

                    {/* Profile View Notifications */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5 text-purple-500" />
                            <div>
                                <Label htmlFor="profileViews" className="font-medium">Profile Views</Label>
                                <p className="text-sm text-muted-foreground">
                                    When someone views your profile
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="profileViews"
                            checked={preferences.profileViews}
                            onCheckedChange={() => handleToggle('profileViews')}
                        />
                    </div>

                    {/* System Notifications */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-gray-500" />
                            <div>
                                <Label htmlFor="system" className="font-medium">System</Label>
                                <p className="text-sm text-muted-foreground">
                                    App updates and important announcements
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="system"
                            checked={preferences.system}
                            onCheckedChange={() => handleToggle('system')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="w-5 h-5" />
                        Quiet Hours
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="quietHours" className="font-medium">Enable Quiet Hours</Label>
                            <p className="text-sm text-muted-foreground">
                                Mute notifications during specific times
                            </p>
                        </div>
                        <Switch
                            id="quietHours"
                            checked={preferences.quietHours.enabled}
                            onCheckedChange={handleQuietHoursToggle}
                        />
                    </div>

                    {preferences.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <Label htmlFor="startTime" className="text-sm font-medium">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={preferences.quietHours.start}
                                    onChange={(e) => handleQuietHoursTime('start', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="endTime" className="text-sm font-medium">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={preferences.quietHours.end}
                                    onChange={(e) => handleQuietHoursTime('end', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}

                    {preferences.quietHours.enabled && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            <Sun className="w-4 h-4" />
                            <span>
                                Notifications will be muted from {preferences.quietHours.start} to {preferences.quietHours.end}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reset Button */}
            <div className="flex justify-end">
                <Button variant="outline" onClick={resetToDefaults}>
                    Reset to Defaults
                </Button>
            </div>
        </div>
    );
}
