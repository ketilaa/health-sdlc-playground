import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { TopBar } from '../TopBar';

describe('TopBar', () => {
  it('renders an element with data-testid="top-bar"', () => {
    render(<TopBar />);
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  it('displays the text "Health Playground" inside the top bar', () => {
    render(<TopBar />);
    const topBar = screen.getByTestId('top-bar');
    expect(within(topBar).getByText('Health Playground')).toBeInTheDocument();
  });

  it('renders the dataset selector nested inside the top bar', () => {
    render(<TopBar />);
    const topBar = screen.getByTestId('top-bar');
    const selector = within(topBar).getByTestId('dataset-selector');
    expect(selector).toBeInTheDocument();
  });

  it('renders the top bar as a banner landmark', () => {
    render(<TopBar />);
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
  });

  it('renders the dataset selector as disabled / non-interactive', () => {
    render(<TopBar />);
    const selector = screen.getByTestId('dataset-selector');
    expect(selector).toHaveAttribute('aria-disabled', 'true');
  });

  it('gives the dataset selector an accessible label indicating it is coming soon', () => {
    render(<TopBar />);
    const selector = screen.getByTestId('dataset-selector');
    expect(selector).toHaveAttribute('aria-label', expect.stringMatching(/coming soon/i));
  });

  it('shows the placeholder label "Select dataset"', () => {
    render(<TopBar />);
    const selector = screen.getByTestId('dataset-selector');
    expect(selector).toHaveTextContent(/select dataset/i);
  });
});