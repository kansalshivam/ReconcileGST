import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReconcileGST — Zero-Cloud Client-Side ITC Audit Terminal | Binary Brains',
  description:
    'Sub-300ms Client-Side GST ITC Reconciliation Engine & Statutory Sentinel (Rule 88D, Rule 37A, Sec 170, GSTR-1A, IMS)',
  keywords: [
    'GST Reconciliation',
    'GSTR-2B',
    'GSTR-3B',
    'Rule 88D',
    'DRC-01C',
    'Rule 37A',
    'Section 170',
    'Section 16(2)(aa)',
    'Zero Cloud',
    'DPDP Act 2023',
  ],
  authors: [{ name: 'Binary Brains (SIH 2026)' }],
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
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
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-terminal-void text-slate-100 antialiased h-screen overflow-hidden flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
