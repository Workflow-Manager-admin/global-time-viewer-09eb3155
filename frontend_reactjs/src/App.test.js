import { render, screen } from '@testing-library/react';
import App from './App';

test('shows the main header', () => {
  render(<App />);
  const titleElement = screen.getByText(/world clock/i);
  expect(titleElement).toBeInTheDocument();
});
