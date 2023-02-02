import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LeafMap from './LeafMap';

describe('<LeafMap />', () => {
  test('it should mount', () => {
    render(<LeafMap />);
    
    const leafMap = screen.getByTestId('LeafMap');

    expect(leafMap).toBeInTheDocument();
  });
});