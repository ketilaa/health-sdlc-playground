import * as React from 'react';
import type { Metadata } from 'next';
import Providers from './providers';
import TopBar from '@/components/TopBar';

export const metadata: Metadata = {
  title: 'Health Playground',
  description: 'An exploratory space for health data.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>
          <TopBar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}