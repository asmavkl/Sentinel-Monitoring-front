import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MonitoringPageContainer } from './MonitoringPageContainer';
import { MonitoringSectionHeader } from './MonitoringSectionHeader';
import { MonitoringEmptyState } from './MonitoringEmptyState';
import { renderWithProviders } from '@/test/testUtils';

describe('MonitoringPageContainer', () => {
  it('renders the title, toolbar, and workspace content', () => {
    renderWithProviders(
      <MonitoringPageContainer title="سامانه های تحت پایش" toolbar={<div>toolbar</div>}>
        <div>workspace</div>
      </MonitoringPageContainer>,
    );

    expect(screen.getByTestId('monitoring-page-container')).toBeInTheDocument();
    expect(screen.getByText('سامانه های تحت پایش')).toBeInTheDocument();
    expect(screen.getByText('toolbar')).toBeInTheDocument();
    expect(screen.getByText('workspace')).toBeInTheDocument();
  });
});

describe('MonitoringSectionHeader', () => {
  it('renders a colored monitoring section bar', () => {
    renderWithProviders(<MonitoringSectionHeader title="سامانه های حیاتی" color="blue" />);

    expect(screen.getByTestId('monitoring-section-header')).toHaveAttribute(
      'data-section-color',
      'blue',
    );
    expect(screen.getByText('سامانه های حیاتی')).toBeInTheDocument();
  });
});

describe('MonitoringEmptyState', () => {
  it('renders the operational empty message', () => {
    renderWithProviders(<MonitoringEmptyState />);

    expect(screen.getByTestId('monitoring-empty-state')).toBeInTheDocument();
    expect(
      screen.getByText('در حال حاضر سامانه ای برای پایش تعریف نشده است'),
    ).toBeInTheDocument();
  });
});
