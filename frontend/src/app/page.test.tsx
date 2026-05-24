import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import AppHeader from '../components/AppHeader';
import HomePage from './page';

describe('HomePage (composed with AppHeader, simulating layout)', () => {
  it('renders the app-header with title and placeholder inside', () => {
    render(
      <>
        <AppHeader />
        <HomePage />
      </>
    );
    const header = screen.getByTestId('app-header');
    expect(header).toBeInTheDocument();
    expect(within(header).getByText('Health Playground')).toBeInTheDocument();
    expect(
      within(header).getByTestId('dataset-selector-placeholder')
    ).toBeInTheDocument();
  });
});