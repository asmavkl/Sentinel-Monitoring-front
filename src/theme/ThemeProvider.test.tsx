import { render, screen, waitFor } from '@testing-library/react';
import { useTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { lightTheme } from './theme';
import { renderWithProviders } from '@/test/testUtils';

function DirectionProbe() {
  const theme = useTheme();
  return <div data-testid="theme-direction">{theme.direction}</div>;
}

describe('ThemeProvider', () => {
  it('applies RTL direction on the theme and document', async () => {
    renderWithProviders(<DirectionProbe />);

    expect(screen.getByTestId('theme-direction')).toHaveTextContent('rtl');
    expect(lightTheme.direction).toBe('rtl');

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute('dir', 'rtl');
      expect(document.documentElement).toHaveAttribute('lang', 'fa');
    });
  });

  it('renders children through the monitoring theme', () => {
    render(
      <ThemeProvider>
        <div>shell</div>
      </ThemeProvider>,
    );

    expect(screen.getByText('shell')).toBeInTheDocument();
  });
});
