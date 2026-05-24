import React from 'react';
import { render, screen, within } from '@testing-library/react';
import HomePage from '../../app/page';

describe('HomePage', () => {
  it('renders the top bar with the application title', () => {
    render(<HomePage />);
    const topBar = screen.getByTestId('top-bar');
    expect(within(topBar).getByText('Health Playground')).toBeInTheDocument();
  });

  it('renders the dataset selector inside the top bar', () => {
    render(<HomePage />);
    const topBar = screen.getByTestId('top-bar');
    expect(within(topBar).getByTestId('dataset-selector')).toBeInTheDocument();
  });

  it('renders a main landmark with hero content', () => {
    render(<HomePage />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(within(main).getByRole('heading', { name: /health playground/i })).toBeInTheDocument();
  });
});