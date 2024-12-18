import React from 'react';
import { render, screen } from '@testing-library/react';
import EventsGrid from './EventsGrid';

describe('EventsGrid', () => {
  it('renders without crashing', () => {
    render(<EventsGrid />);
    // Add more specific tests based on component functionality
  });
});
