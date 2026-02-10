import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '../components/Header/Header';
import Toast from '../components/Toast/Toast';
import NSFWWarning from '../components/NSFWWarning/NSFWWarning';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ChatProvider } from '@/context/ChatContext';
import AdPanel from '../components/AdPanel/AdPanel';

export const metadata: Metadata = {
  title: 'Visual Discovery App - Find Your Inspiration',
  description: 'Discover and save creative ideas from photos and videos. Explore design, art, photography, and more.',
  keywords: ['visual discovery', 'inspiration', 'design', 'art', 'photography', 'videos'],
  manifest: '/manifest.json',
  authors: [{ name: 'Visual Discovery' }],
  openGraph: {
    title: 'Visual Discovery App',
    description: 'Discover and save creative ideas from photos and videos',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
              <Header />
              <main style={{
                padding: 'clamp(12px, 4vw, 20px)',
                minHeight: 'calc(100vh - 64px)',
              }}>
                <NSFWWarning />
                {children}
              </main>
              <Toast />
              <AdPanel />
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
