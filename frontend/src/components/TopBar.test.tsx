import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import TopBar from './TopBar';

describe('TopBar', () => {
  it('renders the top-bar element', () => {
    render(<TopBar />);
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
  });

  it('displays the "Health Playground" title inside the top bar', () => {
    render(<TopBar />);
    const topBar = screen.getByTestId('top-bar');
    expect(within(topBar).getByText('Health Playground')).toBeInTheDocument();
  });

  it('renders the title as an h1', () => {
    render(<TopBar />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Health Playground');
  });

  it('contains the dataset-selector-placeholder nested inside top-bar', () => {
    render(<TopBar />);
    const topBar = screen.getByTestId('top-bar');
    const placeholder = within(topBar).getByTestId(
      'dataset-selector-placeholder'
    );
    expect(placeholder).toBeInTheDocument();
  });

  it('makes the placeholder non-focusable', () => {
    render(<TopBar />);
    const placeholder = screen.getByTestId('dataset-selector-placeholder');
    expect(placeholder).toHaveAttribute('tabindex', '-1');
  });

  it('labels the placeholder for assistive technology', () => {
    render(<TopBar />);
    const placeholder = screen.getByTestId('dataset-selector-placeholder');
    expect(placeholder).toHaveAttribute(
      'aria-label',
      'Dataset selector placeholder, not yet available'
    );
  });
});