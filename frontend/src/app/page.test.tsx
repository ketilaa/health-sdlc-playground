import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the app header with the application title', () => {
    render(<HomePage />);
    const header = screen.getByTestId('app-header');
    expect(header).toBeInTheDocument();
    expect(within(header).getByText('Health Playground')).toBeInTheDocument();
  });

  it('renders the dataset selector placeholder inside the app header', () => {
    render(<HomePage />);
    const header = screen.getByTestId('app-header');
    const placeholder = within(header).getByTestId('dataset-selector-placeholder');
    expect(placeholder).toBeInTheDocument();
  });
});