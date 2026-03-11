import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './lib/auth';

export const metadata: Metadata = {
  title: 'Motives Admin Panel',
  description: 'Admin panel for Motives distributor and DSF management',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
