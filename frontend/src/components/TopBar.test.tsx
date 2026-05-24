import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import TopBar from './TopBar';

describe('TopBar', () => {
  it('renders an element with data-testid "top-bar"', () => {
    render(<TopBar />);
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  it('displays the text "Health Playground" inside the top bar', () => {
    render(<TopBar />);
    const topBar = screen.getByTestId('top-bar');
    expect(within(topBar).getByText('Health Playground')).toBeInTheDocument();
  });

  it('contains a dataset selector placeholder inside the top bar', () => {
    render(<TopBar />);
    const topBar = screen.getByTestId('top-bar');
    expect(within(topBar).getByTestId('dataset-selector-placeholder')).toBeInTheDocument();
  });

  it('marks the dataset selector placeholder as aria-disabled', () => {
    render(<TopBar />);
    const placeholder = screen.getByTestId('dataset-selector-placeholder');
    expect(placeholder).toHaveAttribute('aria-disabled', 'true');
  });
});