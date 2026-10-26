import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BackButton } from './BackButton';
import { renderWithProviders } from '@/test/testUtils';

describe('BackButton', () => {
  it('returns to the fallback route when the page was opened directly', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/checks/4" element={<BackButton fallbackTo="/monitoring/checks" />} />
        <Route path="/monitoring/checks" element={<div>فهرست شاخص‌ها</div>} />
      </Routes>,
      { route: '/checks/4' },
    );

    await user.click(screen.getByRole('button', { name: 'بازگشت' }));

    expect(screen.getByText('فهرست شاخص‌ها')).toBeInTheDocument();
  });
});
