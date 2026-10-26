import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LayoutEditor } from './LayoutEditor';
import { renderWithProviders } from '@/test/testUtils';
import { createStatusCardWidget, defaultWidgetLayout } from '@/test/widgetFixtures';

vi.mock('@/components/widgets/WidgetRenderer', () => ({
  WidgetRenderer: ({ widget }: { widget: { title: string } }) => <div>{widget.title}</div>,
}));

vi.mock('react-grid-layout', () => {
  const GridLayout = ({
    children,
    onDragStop,
    onResizeStop,
    layout,
  }: {
    children: React.ReactNode;
    onDragStop?: (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => void;
    onResizeStop?: (layout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => void;
    layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  }) => (
    <div data-testid="grid-layout">
      <button
        type="button"
        onClick={() =>
          onDragStop?.(
            layout.map((item) =>
              item.i === '1' ? { ...item, x: 3, y: 2 } : item,
            ),
          )
        }
      >
        simulate-drag
      </button>
      <button
        type="button"
        onClick={() =>
          onResizeStop?.(
            layout.map((item) =>
              item.i === '1' ? { ...item, w: 6, h: 4 } : item,
            ),
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

describe('LayoutEditor', () => {
  it('shows empty canvas guidance', () => {
    renderWithProviders(
      <LayoutEditor
        widgets={[]}
        selectedWidgetId={null}
        onWidgetsChange={() => undefined}
        onSelectWidget={() => undefined}
        onEditWidget={() => undefined}
        onDeleteWidget={() => undefined}
      />,
    );

    expect(screen.getByText('ویجت‌ها را از کتابخانه انتخاب کنید')).toBeInTheDocument();
  });

  it('updates layout on drag and resize', async () => {
    const onWidgetsChange = vi.fn();
    const user = userEvent.setup();
    const widget = createStatusCardWidget({
      id: 1,
      layout: { ...defaultWidgetLayout, x: 0, y: 0, width: 4, height: 2 },
    });

    renderWithProviders(
      <LayoutEditor
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
});
