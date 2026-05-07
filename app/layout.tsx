import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic']
});

export const metadata: Metadata = {
  title: 'Vibe Chat',
  description: 'Real-time chat application with push notifications',
  generator: 'Next.js',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Vibe Chat" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vibe Chat" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${figtree.variable} font-sans antialiased font-light`} style={{ fontFamily: 'Figtree, sans-serif' }}>
        {children}
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  )
}
