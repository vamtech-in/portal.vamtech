import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import DevEmailModal from '@/components/common/DevEmailModal';

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

export const metadata: Metadata = {
  title: 'VAMTech Internal Portal | portal.vamtech.in',
  description: 'VAMTech Pvt Ltd Internal Application, Candidate Pipeline & Employee Service Portal',
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
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-[#07111e] text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-vamgold-500 selection:text-vamnavy-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,62,107,0.3),rgba(7,17,30,1))]">
        {children}
        <DevEmailModal />
      </body>
    </html>
  );
}
