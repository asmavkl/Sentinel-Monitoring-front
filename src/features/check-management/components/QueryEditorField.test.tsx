import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QueryEditorField } from './QueryEditorField';

describe('QueryEditorField', () => {
  it('keeps SQL text left-to-right like the SSMS editor', () => {
    render(
      <QueryEditorField
        id="check-query"
        label="Query"
        ariaLabel="Query"
        value="SELECT 1"
        onChange={vi.fn()}
      />,
    );

    const query = screen.getByLabelText('Query');
    expect(query).toHaveAttribute('dir', 'ltr');
    expect(query).toHaveAttribute('lang', 'en');
    expect(query.closest('.sql-query-field')).not.toBeNull();
    expect(screen.getByText('SELECT')).toHaveClass('sql-token--keyword');
  });

  it('inserts spaces on Tab instead of leaving the editor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <QueryEditorField
        id="check-query"
        label="Query"
        ariaLabel="Query"
        value="SELECT"
        onChange={onChange}
      />,
    );

    const query = screen.getByLabelText('Query');
    await user.click(query);
    await user.tab();

    expect(onChange).toHaveBeenCalledWith('SELECT    ');
  });
});
