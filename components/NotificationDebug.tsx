'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import usePushNotifications from '@/hooks/usePushNotifications';

export default function NotificationDebug() {
    const [logs, setLogs] = useState<string[]>([]);
    const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('Unknown');

    const {
        isSupported,
        isSubscribed,
        permission,
        error,
    } = usePushNotifications();

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
        // Check service worker status
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    if (registration) {
                        setServiceWorkerStatus('Registered');
                        addLog(`Service worker registered: ${registration.scope}`);
                    } else {
                        setServiceWorkerStatus('Not registered');
                        addLog('Service worker not registered');
                    }
                })
                .catch(err => {
                    setServiceWorkerStatus('Error');
                    addLog(`Service worker error: ${err.message}`);
                });
        } else {
            setServiceWorkerStatus('Not supported');
            addLog('Service workers not supported');
        }
    }, []);

    useEffect(() => {
        addLog(`Notifications supported: ${isSupported}`);
        addLog(`Permission: ${permission}`);
        addLog(`Subscribed: ${isSubscribed}`);
        if (error) {
            addLog(`Error: ${error.message}`);
        }
    }, [isSupported, permission, isSubscribed, error]);

    const testPermission = async () => {
        addLog('Testing notification permission...');
        try {
            const result = await Notification.requestPermission();
            addLog(`Permission result: ${result}`);
        } catch (err) {
            addLog(`Permission error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const testLocalNotification = () => {
        addLog('Testing local notification...');
        try {
            const notification = new Notification('Test Local', {
                body: 'This is a local test notification',
                icon: '/logo1.png',
                badge: '/logo1.png'
            });
            addLog('Local notification sent successfully');
            setTimeout(() => notification.close(), 5000);
        } catch (err) {
            addLog(`Local notification error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const checkEnvironment = () => {
        addLog('=== Environment Check ===');
        addLog(`Node env: ${process.env.NODE_ENV}`);
        addLog(`VAPID Public Key: ${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Set' : 'Not set'}`);
        addLog(`User Agent: ${navigator.userAgent}`);
        addLog(`HTTPS: ${window.isSecureContext ? 'Yes' : 'No'}`);
        addLog('=== End Check ===');
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-lg">Notification Debug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant={isSupported ? 'default' : 'destructive'}>
                        {isSupported ? 'Supported' : 'Not Supported'}
                    </Badge>
                    <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                        Permission: {permission}
                    </Badge>
                    <Badge variant={isSubscribed ? 'default' : 'outline'}>
                        {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                    </Badge>
                    <Badge variant={serviceWorkerStatus === 'Registered' ? 'default' : 'destructive'}>
                        SW: {serviceWorkerStatus}
                    </Badge>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={testPermission}>
                        Test Permission
                    </Button>
                    <Button size="sm" onClick={testLocalNotification}>
                        Test Local
                    </Button>
                    <Button size="sm" onClick={checkEnvironment}>
                        Check Env
                    </Button>
                    <Button size="sm" onClick={() => setLogs([])}>
                        Clear Logs
                    </Button>
                </div>

                {/* Logs */}
                <div className="bg-gray-100 rounded p-2 h-48 overflow-y-auto text-xs font-mono">
                    {logs.length === 0 ? (
                        <div className="text-gray-500">No logs yet...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="border-b border-gray-200 pb-1 mb-1">
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
