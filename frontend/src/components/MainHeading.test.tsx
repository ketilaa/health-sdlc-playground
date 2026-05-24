import * as React from 'react';
import { render, screen } from '@testing-library/react';
import MainHeading from './MainHeading';

describe('MainHeading', () => {
  it('renders the provided text as an h1', () => {
    render(<MainHeading>Welcome to Health Playground</MainHeading>);
    const heading = screen.getByRole('heading', { level: 1, name: /welcome to health playground/i });
    expect(heading).toBeInTheDocument();
  });

  it('receives focus on mount', () => {
    render(<MainHeading>Welcome to Health Playground</MainHeading>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveFocus();
  });
});