import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Watching World",
  description: "An atmospheric exploration survival game.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1a05",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var isProdHost = location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
                  if (isProdHost) {
                    navigator.serviceWorker.register('/sw.js');
                    return;
                  }

                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) {
                      registration.unregister();
                    });
                  });

                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      keys.forEach(function(key) {
                        caches.delete(key);
                      });
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
