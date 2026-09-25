import type { Metadata } from 'next';
import { Geist, Geist_Mono, Amiri } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const amiri = Amiri({
  variable: '--font-amiri',
  weight: ['400', '700'],
  subsets: ['arabic'],
});

export const metadata: Metadata = {
  title: 'Bayan البيان | Ensiklopedia & Graph Pengetahuan Islam',
  description: 'Sistem pengetahuan Islam interaktif yang menghubungkan konsep, hukum syariat, ayat Al-Qur\'an, hadits shahih, dan rujukan ulama.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto flex">
          {/* Collapsible/Responsive Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          {/* Main Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
