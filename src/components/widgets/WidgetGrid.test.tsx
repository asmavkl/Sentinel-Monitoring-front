import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCallback, useEffect, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { renderWithProviders } from '@/test/testUtils';
import { createStatusCardWidget, defaultWidgetLayout } from '@/test/widgetFixtures';

vi.mock('@/components/widgets/WidgetRenderer', () => ({
  WidgetRenderer: ({ widget }: { widget: { title: string } }) => <div>{widget.title}</div>,
}));

vi.mock('@/components/widgets/WidgetChrome', () => ({
  WidgetChrome: ({
    children,
    widget,
    mode,
    onRefresh,
    onExpand,
  }: {
    children: React.ReactNode;
    widget: { title: string };
    mode: string;
    onRefresh?: (widget: { title: string }) => void;
    onExpand?: (widget: { title: string }) => void;
  }) => (
    <div>
      {mode === 'view' ? (
        <>
          <button type="button" onClick={() => onRefresh?.(widget)}>
            بروزرسانی ویجت {widget.title}
          </button>
          <button type="button" onClick={() => onExpand?.(widget)}>
            باز کردن جزئیات {widget.title}
          </button>
        </>
      ) : null}
      {children}
    </div>
  ),
}));

vi.mock('@/features/dashboard/hooks/useCheckStatus', () => ({
  useCheckStatus: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    dataUpdatedAt: 0,
  }),
}));

const mockRunCheck = vi.fn();
vi.mock('@/features/check-management/hooks/useCheckManagement', () => ({
  useRunCheck: () => ({
    mutateAsync: mockRunCheck,
  }),
}));

const mockRefreshWidget = vi.fn();
vi.mock('@/components/widgets/useWidgetRefresh', () => ({
  useWidgetRefresh: () => mockRefreshWidget,
}));

vi.mock('@/api/apiUtils', () => ({
  getErrorMessage: (error: unknown) => (error as Error).message,
}));

// Mock RTL detection to return false for tests
Object.defineProperty(document, 'documentElement', {
  value: {
    getAttribute: vi.fn(() => 'ltr'),
    setAttribute: vi.fn(),
  },
  configurable: true,
});

vi.mock('react-grid-layout', () => {
  const GridLayout = ({
    children,
    onDragStart,
    onDragStop,
    onResizeStop,
    layout,
  }: {
    children: React.ReactNode;
    onDragStart?: () => void;
    onDragStop?: (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => void;
    onResizeStop?: (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => void;
    layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  }) => (
    <div data-testid="grid-layout">
      <button
        type="button"
        onClick={() => {
          onDragStart?.();
          onDragStop?.(
            layout.map((item) => (item.i === '1' ? { ...item, x: 3, y: 2 } : item)),
          );
        }}
      >
        simulate-drag
      </button>
      <button
        type="button"
        onClick={() =>
          onResizeStop?.(
            layout.map((item) => (item.i === '1' ? { ...item, w: 6, h: 4 } : item)),
          )
        }
      >
        simulate-resize
      </button>
      {children}
    </div>
  );

  return {
    __esModule: true,
    default: GridLayout,
    verticalCompactor: { type: 'vertical', compact: (items: unknown) => items },
    noCompactor: { type: null, allowOverlap: false, compact: (items: unknown) => items },
    useContainerWidth: () => {
      const containerRef = useRef<HTMLElement | null>(null);
      const [width, setWidth] = useState(0);
      const [mounted, setMounted] = useState(false);
      const measureWidth = useCallback(() => {
        if (!containerRef.current) {
          return;
        }
        setWidth(1200);
        setMounted(true);
      }, []);

      useEffect(() => {
        if (!containerRef.current) {
          return;
        }
        measureWidth();
      }, [measureWidth]);

      return { width, mounted, containerRef, measureWidth };
    },
  };
});

vi.mock('react-grid-layout/css/styles.css', () => ({}));
vi.mock('react-resizable/css/styles.css', () => ({}));

describe('WidgetGrid', () => {
  it('updates layout on drag and resize in edit mode', async () => {
    const onWidgetsChange = vi.fn();
    const user = userEvent.setup();
    const widget = createStatusCardWidget({
      id: 1,
      layout: { ...defaultWidgetLayout, x: 0, y: 0, width: 4, height: 2 },
    });

    renderWithProviders(
      <WidgetGrid
        mode="edit"
        widgets={[widget]}
        selectedWidgetId={1}
        onWidgetsChange={onWidgetsChange}
        onSelectWidget={() => undefined}
        onEditWidget={() => undefined}
        onDeleteWidget={() => undefined}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'simulate-drag' }));
    expect(onWidgetsChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 1,
        layout: expect.objectContaining({ x: 3, y: 2 }),
      }),
    ]);

    await user.click(screen.getByRole('button', { name: 'simulate-resize' }));
    expect(onWidgetsChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 1,
        layout: expect.objectContaining({ width: 6, height: 4 }),
      }),
    ]);
  });

  it('keeps view mode static with refresh and expand actions', () => {
    renderWithProviders(
      <WidgetGrid mode="view" widgets={[createStatusCardWidget()]} onWidgetExpand={() => undefined} />,
    );

    expect(screen.getByTestId('section-widget-grid')).toHaveAttribute('data-grid-mode', 'view');
    expect(screen.getByRole('button', { name: 'بروزرسانی ویجت API Health' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'باز کردن جزئیات API Health' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'عملیات ویجت API Health' })).not.toBeInTheDocument();
  });

  it('shows the grid after a widget is added to an empty section', () => {
    const widget = createStatusCardWidget({ id: -2, title: 'کارت جدید' });
    const { rerender } = renderWithProviders(
      <WidgetGrid mode="edit" widgets={[]} onWidgetsChange={() => undefined} />,
    );

    expect(screen.getByText('بوم خالی است')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-layout')).not.toBeInTheDocument();

    rerender(
      <WidgetGrid mode="edit" widgets={[widget]} onWidgetsChange={() => undefined} />,
    );

    expect(screen.getByTestId('grid-layout')).toBeInTheDocument();
    expect(screen.getByText('کارت جدید')).toBeInTheDocument();
  });

  describe('Manual Check Execution', () => {
    beforeEach(() => {
      mockRunCheck.mockClear();
      mockRefreshWidget.mockClear();
    });

    it('calls runCheck API when widget has checkId', async () => {
      mockRunCheck.mockResolvedValue({
        requestId: 123,
        status: 'Pending',
        message: 'Manual execution requested successfully',
      });

      const widget = createStatusCardWidget({
        dataSources: [{ id: 1, checkId: 123, displayOrder: 0 }],
      });

      renderWithProviders(
        <WidgetGrid mode="view" widgets={[widget]} onWidgetExpand={() => undefined} />,
      );

      await userEvent.click(screen.getByRole('button', { name: /بروزرسانی/ }));
      expect(mockRunCheck).toHaveBeenCalledWith(123);
    });

    it('shows success Alert after successful run', async () => {
      mockRunCheck.mockResolvedValue({
        requestId: 123,
        status: 'Pending',
        message: 'Manual execution requested successfully',
      });

      const widget = createStatusCardWidget({
        dataSources: [{ id: 1, checkId: 123, displayOrder: 0 }],
      });

      renderWithProviders(
        <WidgetGrid mode="view" widgets={[widget]} onWidgetExpand={() => undefined} />,
      );

      await userEvent.click(screen.getByRole('button', { name: /بروزرسانی/ }));
      expect(screen.getByText('درخواست اجرای بررسی ثبت شد.')).toBeInTheDocument();
    });

    it('shows error Alert on failure', async () => {
      mockRunCheck.mockRejectedValue(new Error('Check not found'));

      const widget = createStatusCardWidget({
        dataSources: [{ id: 1, checkId: 123, displayOrder: 0 }],
      });

      renderWithProviders(
        <WidgetGrid mode="view" widgets={[widget]} onWidgetExpand={() => undefined} />,
      );

      await userEvent.click(screen.getByRole('button', { name: /بروزرسانی/ }));
      expect(screen.getByText(/Check not found/)).toBeInTheDocument();
    });

    it('prevents duplicate execution for same checkId', async () => {
      mockRunCheck.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ requestId: 123, status: 'Pending', message: 'Success' }), 1000)),
      );

      const widget1 = createStatusCardWidget({
        id: 1,
        title: 'ویجت A',
        dataSources: [{ id: 1, checkId: 123, displayOrder: 0 }],
      });
      const widget2 = createStatusCardWidget({
        id: 2,
        title: 'ویجت B',
        dataSources: [{ id: 2, checkId: 123, displayOrder: 0 }],
      });

      renderWithProviders(
        <WidgetGrid mode="view" widgets={[widget1, widget2]} onWidgetExpand={() => undefined} />,
      );

      // Click on first widget
      await userEvent.click(screen.getByRole('button', { name: /بروزرسانی.*ویجت A/ }));

      // Immediately click on second widget with same checkId
      await userEvent.click(screen.getByRole('button', { name: /بروزرسانی.*ویجت B/ }));

      // Should only call mutateAsync once
      expect(mockRunCheck).toHaveBeenCalledTimes(1);
    });

    it('does not claim execution completed', async () => {
      mockRunCheck.mockResolvedValue({
        requestId: 123,
        status: 'Pending',
        message: 'Manual execution requested successfully',
      });

      const widget = createStatusCardWidget({
        dataSources: [{ id: 1, checkId: 123, displayOrder: 0 }],
      });

      renderWithProviders(
        <WidgetGrid mode="view" widgets={[widget]} onWidgetExpand={() => undefined} />,
      );

      await userEvent.click(screen.getByRole('button', { name: /بروزرسانی/ }));
      expect(screen.queryByText(/بررسی با موفقیت انجام شد/)).not.toBeInTheDocument();
      expect(screen.getByText('درخواست اجرای بررسی ثبت شد.')).toBeInTheDocument();
    });
  });
});
