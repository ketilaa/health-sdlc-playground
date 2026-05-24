import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Health Playground',
  description: 'A space to explore health datasets.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#FAFAF7', color: '#1a1a1f', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}