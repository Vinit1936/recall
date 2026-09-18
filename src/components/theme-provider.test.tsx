import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './theme-provider';

describe('ThemeProvider', () => {
  it('does not render an initialization script inside the client provider', () => {
    const markup = renderToStaticMarkup(
      <ThemeProvider>
        <span>content</span>
      </ThemeProvider>
    );

    expect(markup).not.toContain('<script');
  });
});
