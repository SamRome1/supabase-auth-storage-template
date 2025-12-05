import type { Metadata } from 'next';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'Supabase Photo Gallery',
  description: 'Share and view photos with secure authentication and storage',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
