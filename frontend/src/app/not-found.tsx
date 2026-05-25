import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 72, margin: 0 }}>404</h1>
      <h2 style={{ fontSize: 20, margin: '12px 0 24px 0', color: '#555' }}>
        We couldn&apos;t find that page.
      </h2>
      <Link href="/">Back to home</Link>
    </main>
  )
}