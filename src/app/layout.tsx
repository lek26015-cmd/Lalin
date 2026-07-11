import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Noto_Sans_Thai } from 'next/font/google';
import { LiffProvider } from '@/context/LiffContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lalin — จัดการหนี้และการเงิน',
  description:
    'แอปจัดการหนี้ส่วนตัวและติดตามการเงิน บันทึกรายรับ รายจ่าย และหนี้สิน ด้วยดีไซน์มินิมอล สไตล์อีสานโมเดิร์น',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lalin',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FAF8F5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${outfit.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-sand-50 text-ink-800 font-sans">
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  );
}
