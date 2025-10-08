import '@testing-library/jest-dom'
import 'whatwg-fetch'
import React from 'react'
import { vi } from 'vitest'

// --- Spark KV test shim ---
// Some components use useKV from @github/spark which calls into a KV client
// that expects a global BASE_KV_SERVICE_URL and performs fetches.
// We provide a minimal in-memory KV and intercept fetch calls for tests.

// Define global base URL expected by the bundled spark-tools dist
;(globalThis as unknown as Record<string, unknown>).BASE_KV_SERVICE_URL = '/__test_kv__'

// Preserve original fetch
const __originalFetch = global.fetch

type KvValue = string | number | boolean | object | null
const kvStore = new Map<string, KvValue>()

global.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
	const url = typeof input === 'string' ? input : input.toString()
		const base = String((globalThis as unknown as Record<string, unknown>).BASE_KV_SERVICE_URL)
	if (typeof url === 'string' && url.startsWith(base)) {
		// Normalize path
		const path = url.slice(base.length).replace(/^\//, '') // key or ''
		const method = (init?.method || 'GET').toUpperCase()

		// GET base -> list keys
		if (!path && method === 'GET') {
			return new Response(JSON.stringify(Array.from(kvStore.keys())), { status: 200 })
		}

		// Parse key and optional query (collection is ignored in tests)
		const [rawKey] = path.split('?')
		const key = decodeURIComponent(rawKey)

		if (method === 'GET') {
			if (!kvStore.has(key)) {
				return new Response('Not Found', { status: 404, statusText: 'Not Found' })
			}
			const value = kvStore.get(key)
			return new Response(JSON.stringify(value ?? null), {
				status: 200,
				headers: { 'Content-Type': 'text/plain' },
			})
		}

		if (method === 'POST') {
			// Body is JSON string; set directly
			const bodyText = typeof init?.body === 'string' ? init?.body : ''
			try {
				const parsed = bodyText ? JSON.parse(bodyText) : null
				kvStore.set(key, parsed)
			} catch {
				// If parsing fails, store raw string
				kvStore.set(key, bodyText as unknown as KvValue)
			}
			return new Response('', { status: 200 })
		}

		if (method === 'DELETE') {
			kvStore.delete(key)
			return new Response('', { status: 200 })
		}

		return new Response('Method Not Allowed', { status: 405 })
	}

	// Fallback to original fetch for other URLs
		return __originalFetch(input as RequestInfo, init)
	}) as unknown as typeof fetch
// Mock @github/spark/hooks to avoid hitting real KV client in tests
vi.mock('@github/spark/hooks', () => {
	const store = new Map<string, unknown>()
	function useKV<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
		const [value, setValue] = React.useState<T>(() => {
			if (store.has(key)) return store.get(key) as T
			store.set(key, initial)
			return initial
		})
		React.useEffect(() => {
			store.set(key, value)
		}, [key, value])
		return [value, setValue]
	}
	return { useKV }
})

// --- DOM polyfills for tests ---
// Radix UI tooltips/popovers rely on ResizeObserver which jsdom doesn't provide
class ResizeObserverMock implements ResizeObserver {
	constructor() {}
	observe(): void {}
	unobserve(): void {}
	disconnect(): void {}
}
;(globalThis as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
	(globalThis as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver ||
	(ResizeObserverMock as unknown as typeof ResizeObserver)
