import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import AppHeader from './AppHeader';

describe('AppHeader', () => {
  it('renders an element with data-testid "app-header"', () => {
    render(<AppHeader />);
    expect(screen.getByTestId('app-header')).toBeInTheDocument();
  });

  it('displays the text "Health Playground" inside the app-header', () => {
    render(<AppHeader />);
    const header = screen.getByTestId('app-header');
    expect(within(header).getByText('Health Playground')).toBeInTheDocument();
  });

  it('contains the dataset-selector-placeholder inside the app-header', () => {
    render(<AppHeader />);
    const header = screen.getByTestId('app-header');
    expect(
      within(header).getByTestId('dataset-selector-placeholder')
    ).toBeInTheDocument();
  });
});