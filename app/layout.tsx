import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo'
});

export const metadata: Metadata = {
  title: 'نظام إدارة العيادة',
  description: 'نظام إدارة عيادة أسنان',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-bg text-text antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
