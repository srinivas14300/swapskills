import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    render(<Button>Test Button</Button>);
    // Add more specific tests based on component functionality
  });
});
