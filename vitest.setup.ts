import '@testing-library/jest-dom'
import 'whatwg-fetch'
import React from 'react'
import { vi } from 'vitest'

// Provide a BASE_KV_SERVICE_URL for bundled spark-tools (defensive)
;(globalThis as unknown as Record<string, unknown>).BASE_KV_SERVICE_URL = '/__test_kv__'

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
