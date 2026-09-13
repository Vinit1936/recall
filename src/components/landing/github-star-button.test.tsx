import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { GitHubStarButton } from './github-star-button';

describe('GitHubStarButton', () => {
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    });
  });

  it('uses the same initial markup when cached stars exist in the browser', () => {
    const serverMarkup = renderToStaticMarkup(<GitHubStarButton />);

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: {
          getItem: () => '9',
        },
      },
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => '9',
      },
    });

    const clientMarkup = renderToStaticMarkup(<GitHubStarButton />);

    expect(clientMarkup).toBe(serverMarkup);
  });
});
