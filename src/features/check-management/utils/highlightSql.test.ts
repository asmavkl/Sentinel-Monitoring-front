import { describe, expect, it } from 'vitest';
import { highlightSql } from './highlightSql';

function typesOf(sql: string) {
  return highlightSql(sql).map((token) => [token.type, token.value]);
}

describe('highlightSql', () => {
  it('keeps the original text intact', () => {
    const sql = "SELECT avg(TotalTime) as avg FROM [dbo].[Log] where Method = 'showAddForm'";
    expect(highlightSql(sql).map((token) => token.value).join('')).toBe(sql);
  });

  it('colors keywords, function calls, strings, and comments', () => {
    const tokens = highlightSql("SELECT avg(TotalTime) as avg -- note\nwhere Name = 'a'");

    expect(tokens.find((token) => token.value === 'SELECT')?.type).toBe('keyword');
    expect(tokens.find((token) => token.value === 'where')?.type).toBe('keyword');
    expect(tokens.filter((token) => token.type === 'function').map((token) => token.value)).toEqual(['avg']);
    expect(tokens.some((token) => token.type === 'text' && token.value.includes('avg'))).toBe(true);
    expect(tokens.find((token) => token.value === '-- note')?.type).toBe('comment');
    expect(tokens.find((token) => token.value === "'a'")?.type).toBe('string');
  });

  it('does not treat bracketed names as keywords', () => {
    expect(typesOf('FROM [select]')).toEqual([
      ['keyword', 'FROM'],
      ['text', ' [select]'],
    ]);
  });

  it('keeps escaped quotes inside strings', () => {
    expect(typesOf("N'O''Brien'")).toEqual([['string', "N'O''Brien'"]]);
  });
});
