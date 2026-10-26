import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardSectionRenderer } from '@/components/widgets/DashboardSectionRenderer';
import { createStatusCardWidget } from '@/test/widgetFixtures';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/theme';

vi.mock('@/features/dashboard/hooks/useCheckHistory', () => ({
  useCheckHistory: () => ({
    isLoading: false,
    isError: false,
    data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 50, totalPages: 0 },
  }),
}));

vi.mock('@/features/dashboard/hooks/useCheckStatus', () => ({
  useCheckStatus: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    dataUpdatedAt: 0,
  }),
}));

vi.mock('react-grid-layout', () => {
  const GridLayout = ({
    children,
    layout,
  }: {
    children: ReactNode;
    layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  }) => (
    <div data-testid="grid-layout">
      {layout.map((item) => (
        <div
          key={item.i}
          data-testid={`grid-item-${item.i}`}
          data-x={item.x}
          data-y={item.y}
          data-w={item.w}
          data-h={item.h}
        />
      ))}
      {children}
    </div>
  );

  return {
    __esModule: true,
    default: GridLayout,
    verticalCompactor: { type: 'vertical', compact: (items: any[]) => items },
    noCompactor: { type: null, allowOverlap: false, compact: (items: any[]) => items },
    useContainerWidth: () => ({
      width: 1200,
      mounted: true,
      containerRef: { current: null },
      measureWidth: () => undefined,
    }),
  };
});

vi.mock('react-grid-layout/css/styles.css', () => ({}));
vi.mock('react-resizable/css/styles.css', () => ({}));

function renderSection(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('DashboardSectionRenderer', () => {
  it('renders a section title and widgets on shared RGL positions', () => {
    const widget = createStatusCardWidget({
      layout: { x: 4, y: 2, width: 6, height: 3 },
    });

    renderSection(
      <DashboardSectionRenderer
        section={{
          id: 1,
          title: 'Service Health',
          displayOrder: 0,
          isVisible: true,
          widgets: [widget],
        }}
      />,
    );

    expect(screen.getByText('Service Health')).toBeInTheDocument();
    expect(screen.getByText('API Health')).toBeInTheDocument();
    expect(screen.getByTestId('section-widget-grid')).toHaveAttribute('data-grid-mode', 'view');
    expect(screen.getByTestId('view-widget-1')).toHaveAttribute('data-grid-x', '4');
    expect(screen.getByTestId('view-widget-1')).toHaveAttribute('data-grid-y', '2');
    expect(screen.getByTestId('view-widget-1')).toHaveAttribute('data-grid-w', '6');
    expect(screen.getByTestId('view-widget-1')).toHaveAttribute('data-grid-h', '3');
    expect(screen.getByTestId('grid-item-1')).toHaveAttribute('data-x', '4');
    expect(screen.getByTestId('grid-item-1')).toHaveAttribute('data-y', '2');
  });

  it('does not render hidden sections', () => {
    const { container } = renderSection(
      <DashboardSectionRenderer
        section={{
          id: 2,
          title: 'Hidden',
          displayOrder: 0,
          isVisible: false,
          widgets: [createStatusCardWidget()],
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows view chrome actions without settings', () => {
    renderSection(
      <DashboardSectionRenderer
        section={{
          id: 1,
          title: 'Service Health',
          displayOrder: 0,
          isVisible: true,
          widgets: [createStatusCardWidget()],
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'بروزرسانی ویجت API Health' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'باز کردن جزئیات API Health' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'عملیات ویجت API Health' })).not.toBeInTheDocument();
  });
});
