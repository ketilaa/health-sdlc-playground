import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders with data-testid="app-header" and the application title text', () => {
    render(<AppHeader />);
    const header = screen.getByTestId('app-header');
    expect(header).toBeInTheDocument();
    expect(within(header).getByText('Health Playground')).toBeInTheDocument();
  });

  it('contains the dataset selector placeholder inside the header', () => {
    render(<AppHeader />);
    const header = screen.getByTestId('app-header');
    const placeholder = within(header).getByTestId('dataset-selector-placeholder');
    expect(placeholder).toBeInTheDocument();
  });
});