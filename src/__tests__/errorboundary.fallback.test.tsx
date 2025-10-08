import React from 'react'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '@/ErrorFallback'

const Boom: React.FC = () => {
  // Throw during render
  throw new Error('Kaboom')
  // Unreachable, but satisfies JSX return type
  // eslint-disable-next-line no-unreachable
  return null as unknown as React.ReactElement
}

describe('ErrorBoundary + ErrorFallback', () => {
  let originalEnv: any

  beforeAll(() => {
    // Capture env and force DEV=true (library rethrows in DEV)
    originalEnv = import.meta.env
    // @ts-expect-error test override
    import.meta.env = { ...originalEnv, DEV: true }
  })

  afterAll(() => {
    // @ts-expect-error restore env
    import.meta.env = originalEnv
  })

  it('rethrows in DEV mode (no fallback render)', () => {
    // In DEV, our ErrorFallback rethrows to surface the error for better DX.
    // The boundary will not render, so we assert that rendering throws.
    expect(() =>
      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Boom />
        </ErrorBoundary>
      )
    ).toThrowError(/Kaboom/)
  })
})
