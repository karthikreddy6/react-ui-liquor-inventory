import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Inventory Console title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Inventory Console/i);
  expect(titleElement).toBeInTheDocument();
});
