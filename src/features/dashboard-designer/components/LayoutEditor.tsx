import type { WidgetGridProps } from '@/components/widgets/WidgetGrid';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';

type LayoutEditorProps = Omit<WidgetGridProps, 'mode'> & {
  previewMode?: boolean;
};

/** Designer canvas — shares the same RGL layout engine as the view (`WidgetGrid`). */
export function LayoutEditor({
  previewMode = false,
  emptyDescription = 'ویجت‌ها را از کتابخانه انتخاب کنید',
  ...props
}: LayoutEditorProps) {
  return (
    <WidgetGrid
      mode="edit"
      previewMode={previewMode}
      emptyDescription={emptyDescription}
      {...props}
    />
  );
}
