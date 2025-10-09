#!/usr/bin/env node
/*
  Safe API key validator: checks OpenAI, Gemini, GitHub PAT without printing secrets.
  Usage:
    node scripts/validate-keys.mjs --env .evn
*/
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const envFileIdx = argv.findIndex(a => a === '--env');
const envFile = envFileIdx !== -1 ? argv[envFileIdx + 1] : undefined;

function loadDotEnvLike(filePath) {
  const out = {};
  if (!filePath) return out;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      out[key] = val;
    }
  } catch (_) {
    // ignore
  }
  return out;
}

const fileEnv = loadDotEnvLike(envFile && path.resolve(envFile));
const getEnv = (k) => process.env[k] || fileEnv[k] || '';

const mask = (s) => {
  if (!s) return '';
  if (s.length <= 8) return '*'.repeat(s.length);
  return `${s.slice(0,4)}…${s.slice(-4)}`;
};

const withTimeout = async (p, ms = 8000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
};

async function checkOpenAI(apiKey) {
  if (!apiKey) return { provider: 'openai', present: false, valid: false, reason: 'missing' };
  try {
    const resp = await withTimeout((signal) => fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal,
    }));
    const ok = resp.status === 200;
    return { provider: 'openai', present: true, valid: ok, httpStatus: resp.status };
  } catch (e) {
    return { provider: 'openai', present: true, valid: false, reason: 'network_error' };
  }
}

async function checkGemini(apiKey) {
  if (!apiKey) return { provider: 'gemini', present: false, valid: false, reason: 'missing' };
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const resp = await withTimeout((signal) => fetch(url, { method: 'GET', signal }));
    const ok = resp.status === 200;
    return { provider: 'gemini', present: true, valid: ok, httpStatus: resp.status };
  } catch (e) {
    return { provider: 'gemini', present: true, valid: false, reason: 'network_error' };
  }
}

async function checkGitHubPAT(pat) {
  if (!pat) return { provider: 'github', present: false, valid: false, reason: 'missing' };
  const looksLikePAT = /^(ghp_|github_pat_)/.test(pat) || pat.includes('github_pat_');
  if (!looksLikePAT) return { provider: 'github', present: true, valid: false, reason: 'format_suspect' };
  try {
    const resp = await withTimeout((signal) => fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${pat}`, 'User-Agent': 'token-validator' },
      signal,
    }));
    const ok = resp.status === 200;
    return { provider: 'github', present: true, valid: ok, httpStatus: resp.status };
  } catch (e) {
    return { provider: 'github', present: true, valid: false, reason: 'network_error' };
  }
}

async function main() {
  const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');
  const GEMINI_API_KEY = getEnv('GEMINI_API_KEY');
  const COPILOT_API_KEY = getEnv('COPILOT_API_KEY');

  const results = [];
  results.push({ provider: 'openai', keyPreview: mask(OPENAI_API_KEY) });
  results.push({ provider: 'gemini', keyPreview: mask(GEMINI_API_KEY) });
  results.push({ provider: 'github', keyPreview: mask(COPILOT_API_KEY) });

  const [o, g, gh] = await Promise.all([
    checkOpenAI(OPENAI_API_KEY),
    checkGemini(GEMINI_API_KEY),
    checkGitHubPAT(COPILOT_API_KEY),
  ]);

  const summary = {
    timestamp: new Date().toISOString(),
    inputs: results,
    checks: [o, g, gh],
    liveTools: {
      openai: o.valid,
      gemini: g.valid,
      github: gh.valid,
    }
  };

  // Print machine-friendly JSON without secrets
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error('Validator error');
  process.exit(2);
});
