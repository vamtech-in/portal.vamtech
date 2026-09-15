import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VAMTech Careers & Application Portal | career.vamtech.in',
  description: 'VAMTech Pvt Ltd Candidate Application Pipeline, Career Opportunities & Staff Portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-[#F5F4EF] text-[#111111] min-h-screen flex flex-col font-sans antialiased selection:bg-[#FF4400] selection:text-white">
        {children}
      </body>
    </html>
  );
}
