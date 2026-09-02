import type { Metadata } from 'next';
import './globals.css';
import DevEmailModal from '@/components/common/DevEmailModal';

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
    <html lang="en" className="dark">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-vamnavy-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-vamgold-500 selection:text-vamnavy-950">
        {children}
        <DevEmailModal />
      </body>
    </html>
  );
}
