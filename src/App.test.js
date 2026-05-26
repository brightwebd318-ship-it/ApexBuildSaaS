import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ApexBuild branding on login page', () => {
  render(<App />);
  const brandingElement = screen.getByText(/ApexBuild/i);
  expect(brandingElement).toBeInTheDocument();
});

