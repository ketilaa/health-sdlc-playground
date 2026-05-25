import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import NotFound from './not-found'

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
})