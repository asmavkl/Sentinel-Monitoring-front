import { FormControl, FormHelperText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type UIEvent } from 'react';
import { highlightSql, type SqlToken } from '../utils/highlightSql';
import '@/styles/sqlQueryEditor.css';

const INDENT = '    ';

interface QueryEditorFieldProps {
  id: string;
  label: string;
  value: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  minRows?: number;
  ariaLabel: string;
  language?: 'sql' | 'plain';
  onChange: (value: string) => void;
}

function tokenClassName(token: SqlToken): string | undefined {
  if (token.type === 'text') {
    return undefined;
  }
  return `sql-token sql-token--${token.type}`;
}

export function QueryEditorField({
  id,
  label,
  value,
  error = false,
  helperText,
  required = false,
  disabled = false,
  minRows = 8,
  ariaLabel,
  language = 'sql',
  onChange,
}: QueryEditorFieldProps) {
  const theme = useTheme();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLPreElement | null>(null);
  const caretRef = useRef<number | null>(null);

  const syncScroll = () => {
    const input = inputRef.current;
    const highlight = highlightRef.current;
    if (!input || !highlight) {
      return;
    }
    highlight.scrollTop = input.scrollTop;
    highlight.scrollLeft = input.scrollLeft;
  };

  useLayoutEffect(() => {
    const input = inputRef.current;
    const caret = caretRef.current;
    if (input && caret != null) {
      caretRef.current = null;
      input.setSelectionRange(caret, caret);
    }
    syncScroll();
  }, [value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab' || disabled || event.shiftKey) {
      return;
    }

    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    caretRef.current = start + INDENT.length;
    onChange(`${value.slice(0, start)}${INDENT}${value.slice(end)}`);
  };

  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const highlight = highlightRef.current;
    if (!highlight) {
      return;
    }
    highlight.scrollTop = event.currentTarget.scrollTop;
    highlight.scrollLeft = event.currentTarget.scrollLeft;
  };

  const shellStyle = {
    '--sql-border': theme.palette.divider,
    '--sql-focus': theme.palette.primary.main,
    '--sql-error': theme.palette.error.main,
    '--sql-bg': theme.palette.background.paper,
    '--sql-text': theme.palette.text.primary,
    '--sql-label': theme.palette.text.secondary,
    '--sql-rows': String(minRows),
  } as CSSProperties;

  const tokens = language === 'sql' ? highlightSql(value) : null;

  return (
    <FormControl className="sql-query-field" fullWidth error={error} disabled={disabled} required={required}>
      <div
        className="sql-query-shell"
        data-error={error ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
        data-sql-theme={theme.palette.mode}
        style={shellStyle}
      >
        <div className="sql-query-surface" dir="ltr">
          <pre ref={highlightRef} className="sql-query-highlight" aria-hidden="true">
            {tokens
              ? tokens.map((token, index) => (
                  <span key={`${token.type}-${index}`} className={tokenClassName(token)}>
                    {token.value}
                  </span>
                ))
              : value}
          </pre>
          <textarea
            ref={inputRef}
            id={id}
            className="sql-query-input"
            value={value}
            aria-label={ariaLabel}
            dir="ltr"
            lang="en"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            wrap="off"
            disabled={disabled}
            required={required}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
          />
        </div>
        <fieldset aria-hidden="true">
          <legend>
            <label htmlFor={id}>
              {label}
              {required ? ' *' : ''}
            </label>
          </legend>
        </fieldset>
      </div>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
