export type SqlTokenType = 'text' | 'keyword' | 'function' | 'string' | 'comment' | 'number';

export interface SqlToken {
  type: SqlTokenType;
  value: string;
}

const KEYWORDS = new Set([
  'select',
  'from',
  'where',
  'and',
  'or',
  'not',
  'in',
  'is',
  'null',
  'as',
  'join',
  'inner',
  'left',
  'right',
  'full',
  'outer',
  'cross',
  'on',
  'group',
  'by',
  'order',
  'having',
  'insert',
  'into',
  'values',
  'update',
  'set',
  'delete',
  'create',
  'alter',
  'drop',
  'table',
  'view',
  'index',
  'distinct',
  'top',
  'union',
  'all',
  'exists',
  'between',
  'like',
  'case',
  'when',
  'then',
  'else',
  'end',
  'begin',
  'declare',
  'if',
  'while',
  'return',
  'exec',
  'execute',
  'with',
  'over',
  'partition',
  'asc',
  'desc',
  'offset',
  'fetch',
  'next',
  'only',
  'apply',
  'pivot',
  'unpivot',
  'output',
  'merge',
  'using',
  'matched',
  'constraint',
  'primary',
  'key',
  'foreign',
  'references',
  'default',
  'check',
  'unique',
  'identity',
  'procedure',
  'function',
  'trigger',
  'database',
  'schema',
  'use',
  'go',
  'transaction',
  'commit',
  'rollback',
  'try',
  'catch',
  'throw',
  'raiserror',
  'print',
  'waitfor',
  'delay',
  'nolock',
  'option',
  'recompile',
  'grant',
  'revoke',
  'deny',
  'open',
  'close',
  'cursor',
  'deallocate',
  'break',
  'continue',
  'into',
  'percent',
  'ties',
  'rows',
  'range',
  'unbounded',
  'preceding',
  'following',
  'current',
  'row',
  'int',
  'bigint',
  'bit',
  'varchar',
  'nvarchar',
  'char',
  'nchar',
  'datetime',
  'datetime2',
  'date',
  'time',
  'decimal',
  'numeric',
  'float',
  'real',
  'money',
  'uniqueidentifier',
]);

const FUNCTIONS = new Set([
  'avg',
  'count',
  'sum',
  'min',
  'max',
  'getdate',
  'getutcdate',
  'sysdatetime',
  'dateadd',
  'datediff',
  'datepart',
  'datename',
  'year',
  'month',
  'day',
  'len',
  'substring',
  'replace',
  'charindex',
  'patindex',
  'ltrim',
  'rtrim',
  'trim',
  'upper',
  'lower',
  'concat',
  'cast',
  'convert',
  'isnull',
  'coalesce',
  'nullif',
  'round',
  'abs',
  'ceiling',
  'floor',
  'newid',
  'row_number',
  'rank',
  'dense_rank',
  'ntile',
  'count_big',
  'string_agg',
  'format',
  'try_cast',
  'try_convert',
  'isdate',
  'isnumeric',
  'iif',
  'stuff',
]);

function isIdentifierChar(char: string | undefined): boolean {
  return char != null && /[A-Za-z0-9_]/.test(char);
}

function isFunctionCall(source: string, index: number): boolean {
  let cursor = index;
  while (cursor < source.length && /\s/.test(source[cursor] ?? '')) {
    cursor += 1;
  }
  return source[cursor] === '(';
}

export function highlightSql(source: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let index = 0;

  const push = (type: SqlTokenType, value: string) => {
    if (!value) {
      return;
    }
    const last = tokens[tokens.length - 1];
    if (last && last.type === 'text' && type === 'text') {
      last.value += value;
      return;
    }
    tokens.push({ type, value });
  };

  while (index < source.length) {
    const current = source[index] ?? '';
    const next = source[index + 1] ?? '';

    if (current === '-' && next === '-') {
      const lineEnd = source.indexOf('\n', index);
      const stop = lineEnd === -1 ? source.length : lineEnd;
      push('comment', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (current === '/' && next === '*') {
      const blockEnd = source.indexOf('*/', index + 2);
      const stop = blockEnd === -1 ? source.length : blockEnd + 2;
      push('comment', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (current === "'" || (current === 'N' && next === "'")) {
      const start = index;
      index = current === 'N' ? index + 2 : index + 1;
      while (index < source.length) {
        if (source[index] === "'" && source[index + 1] === "'") {
          index += 2;
          continue;
        }
        if (source[index] === "'") {
          index += 1;
          break;
        }
        index += 1;
      }
      push('string', source.slice(start, index));
      continue;
    }

    if (current === '[') {
      const closing = source.indexOf(']', index + 1);
      const stop = closing === -1 ? index + 1 : closing + 1;
      push('text', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (current === '"') {
      const closing = source.indexOf('"', index + 1);
      const stop = closing === -1 ? index + 1 : closing + 1;
      push('text', source.slice(index, stop));
      index = stop;
      continue;
    }

    if (/\d/.test(current) && !isIdentifierChar(source[index - 1])) {
      let end = index + 1;
      while (end < source.length && /[\d.]/.test(source[end] ?? '')) {
        end += 1;
      }
      push('number', source.slice(index, end));
      index = end;
      continue;
    }

    if (/[A-Za-z_]/.test(current)) {
      let end = index + 1;
      while (isIdentifierChar(source[end])) {
        end += 1;
      }
      const word = source.slice(index, end);
      const normalized = word.toLowerCase();
      let type: SqlTokenType = 'text';
      if (FUNCTIONS.has(normalized) && isFunctionCall(source, end)) {
        type = 'function';
      } else if (KEYWORDS.has(normalized)) {
        type = 'keyword';
      }
      push(type, word);
      index = end;
      continue;
    }

    push('text', current);
    index += 1;
  }

  return tokens;
}
