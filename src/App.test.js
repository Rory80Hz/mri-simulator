import { render, screen } from '@testing-library/react';
import App from './App';

test('renders mri simulator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/NexHex MRI Simulator/i);
  expect(titleElement).toBeInTheDocument();
});
