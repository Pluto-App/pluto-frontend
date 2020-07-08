import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import BackButton from '../components/widgets/BackButton';
import HomePage from '../components/pages/HomePage';

test('BackButton has no render issues', () => {
  const { getByText } = render(<BackButton />);
  const linkElement = getByText(/keyboard/i);
});