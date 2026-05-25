import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'
import RootLayout from './layout'

describe('RootLayout', () => {
  test('renders children inside the document body', () => {
    // RootLayout returns <html><body>...</body></html>; React testing-library
    // will render it inside a container — we just verify children pass through.
    const { container } = render(
      <RootLayout>
        <div data-testid="child">hello</div>
      </RootLayout>
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })
})