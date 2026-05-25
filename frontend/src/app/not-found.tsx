import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      role="main"
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
      <p
        aria-hidden="true"
        style={{ fontSize: 72, fontWeight: 700, margin: 0, lineHeight: 1 }}
      >
        404
      </p>
      <h1 style={{ fontSize: 28, margin: '12px 0 16px 0' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#888', margin: '0 0 24px 0' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '10px 24px',
          background: '#1976d2',
          color: '#fff',
          borderRadius: 4,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Go to Dashboard
      </Link>
    </main>
  )
}