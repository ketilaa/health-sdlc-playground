import * as React from 'react';
import type { Metadata } from 'next';
import AppHeader from '../components/AppHeader';

export const metadata: Metadata = {
  title: 'Health Playground'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}