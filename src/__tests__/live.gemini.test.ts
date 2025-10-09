import { it, expect, describe } from 'vitest';

const shouldRun = process.env.RUN_GEMINI_TEST === '1' && !!process.env.GEMINI_API_KEY;

describe.skipIf(!shouldRun)('Live Gemini smoke', () => {
  it('lists models', async () => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY!)}`;
    const resp = await fetch(url);
    expect(resp.status).toBe(200);
    const js = await resp.json();
    expect(Array.isArray(js.models) || Array.isArray(js.data) || typeof js === 'object').toBe(true);
  }, 20000);
});
