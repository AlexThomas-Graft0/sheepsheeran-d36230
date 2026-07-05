import './globals.css';
import { Poppins, IBM_Plex_Mono } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '700'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
});

export const metadata = {
  title: 'sheepsheeran',
  description: 'Travelling sheep shearer providing high quality output, estimation per flock, on-site service, complete clean up, and highly professional work.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${mono.variable}`}>
      <body className="bg-white text-[#111827] antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}