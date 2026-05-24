import React from 'react';
import { TopBar } from '../components/TopBar';
import { Hero } from '../components/Hero';

export default function HomePage() {
  return (
    <>
      <TopBar />
      <main role="main">
        <Hero />
      </main>
    </>
  );
}