import { it, expect, describe } from 'vitest';

const shouldRun = process.env.RUN_OPENAI_TEST === '1' && !!process.env.OPENAI_API_KEY;

describe.skipIf(!shouldRun)('Live OpenAI smoke', () => {
  it('lists models', async () => {
    const resp = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    });
    expect(resp.status).toBe(200);
    const js = await resp.json();
    expect(Array.isArray(js.data)).toBe(true);
  }, 20000);
});
