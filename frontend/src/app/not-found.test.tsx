import '@testing-library/jest-dom'
import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFound from './not-found'

// HTTP 404 status assertion for Scenario 7:
// With Next.js static export + `npx serve`, the 404.html page is served
// automatically by the static file server for unknown routes.
// The HTTP status assertion is deferred to E2E (requires a running server).
// This test verifies the component structure that Next.js uses to generate 404.html.

describe('NotFound (404 page)', () => {
  it('renders the H1 "Page Not Found"', () => {
    render(<NotFound />)
    expect(
      screen.getByRole('heading', { level: 1, name: /page not found/i })
    ).toBeInTheDocument()
  })

  it('renders the decorative "404" text (not as a heading)', () => {
    render(<NotFound />)
    // "404" is in a <p aria-hidden>, not a heading
    const headings = screen.queryAllByRole('heading')
    const headingTexts = headings.map((h) => h.textContent)
    expect(headingTexts).not.toContain('404')
    // It is present in the document as non-heading text
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders the explanatory paragraph', () => {
    render(<NotFound />)
    expect(
      screen.getByText(/the page you're looking for doesn't exist/i)
    ).toBeInTheDocument()
  })

  it('renders a "Go to Dashboard" link pointing to "/"', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /go to dashboard/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('has role="main" on the content area', () => {
    render(<NotFound />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('not-found.tsx file exists (Next.js uses it to generate 404.html for HTTP 404 responses)', () => {
    const path = require('path')
    const fs = require('fs')
    const filePath = path.resolve(__dirname, './not-found.tsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })
})