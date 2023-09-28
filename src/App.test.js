import React from 'react';
import App from './App';
import {render} from '@testing-library/react';


test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
