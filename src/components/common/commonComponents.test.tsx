import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState, ErrorMessage, Loading, StatusBadge } from '@/components/common';

describe('common components', () => {
  it('renders Loading', () => {
    render(<Loading message="Fetching data" />);
    expect(screen.getByText('Fetching data')).toBeInTheDocument();
  });

  it('renders ErrorMessage', () => {
    render(<ErrorMessage message="Request failed" />);
    expect(screen.getByText('Request failed')).toBeInTheDocument();
  });

  it('renders EmptyState', () => {
    render(<EmptyState title="No data" description="Try again later" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('renders StatusBadge variants', () => {
    const { rerender } = render(<StatusBadge status="UP" />);
    expect(screen.getByText('سالم')).toBeInTheDocument();

    rerender(<StatusBadge status="DOWN" label="Service down" />);
    expect(screen.getByText('Service down')).toBeInTheDocument();

    rerender(<StatusBadge status="WARNING" />);
    expect(screen.getByText('هشدار')).toBeInTheDocument();

    rerender(<StatusBadge status="UNKNOWN" />);
    expect(screen.getByText('نامشخص')).toBeInTheDocument();
  });
});
