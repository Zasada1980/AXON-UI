
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

describe('UI smoke', () => {
  let rootDiv: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    rootDiv = document.createElement('div');
    rootDiv.setAttribute('id', 'root');
    document.body.appendChild(rootDiv);
  });

  afterEach(() => {
    if (root) {
      // Unmount React tree
      root.unmount();
      root = null;
    }
    if (rootDiv && rootDiv.parentNode) {
      rootDiv.parentNode.removeChild(rootDiv);
      rootDiv = null;
    }
    document.body.innerHTML = '';
  });

  it('renders with React 19 root API without crashing', async () => {
    const container = document.getElementById('root');
    expect(container).not.toBeNull();
    await act(async () => {
      root = createRoot(container!);
      root.render(<div data-testid="smoke">ok</div>);
    });
    expect(container!.textContent).toContain('ok');
  });
});
