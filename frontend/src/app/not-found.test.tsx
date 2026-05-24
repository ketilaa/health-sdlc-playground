import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import NotFound from './not-found';

describe('NotFound page', () => {
  it('renders the app header with the application title', () => {
    render(<NotFound />);
    const header = screen.getByTestId('app-header');
    expect(within(header).getByText('Health Playground')).toBeInTheDocument();
  });

  it('renders the "Page not found" heading and Go home link', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument();
  });
});