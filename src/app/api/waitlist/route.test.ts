import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { rpc, from } = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }))
vi.mock('@/lib/supabaseServer', () => ({ createServiceClient: () => ({ rpc, from }) }))
import { GET, POST } from './route'

function configured() {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key')
  vi.stubEnv('WAITLIST_RATE_LIMIT_SECRET', 'test-only-secret')
}
function request(email = 'member@example.com', ip = '203.0.113.1', body?: string) {
  return new NextRequest('https://cribble.dev/api/waitlist', {
    method: 'POST', body: body ?? JSON.stringify({ email }),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }
  })
}

describe('public waitlist route', () => {
  beforeEach(() => { rpc.mockReset(); from.mockReset(); configured() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('fails closed before accepting PII when durable admission is unconfigured', async () => {
    vi.stubEnv('WAITLIST_RATE_LIMIT_SECRET', '')
    const email = 'private@example.com'
    const response = await POST(request(email))
    expect(response.status).toBe(503)
    expect(JSON.stringify(await response.json())).not.toContain(email)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON and disposable addresses before storage', async () => {
    expect((await POST(request('', '', '{'))).status).toBe(400)
    expect((await POST(request('x@mailinator.com'))).status).toBe(400)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('returns no retained admission data and sends only normalized email plus HMAC fingerprint', async () => {
    rpc.mockResolvedValue({ data: 'admitted', error: null })
    const response = await POST(request('Member@Example.com', '203.0.113.9'))
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ message: 'Successfully added to waitlist' })
    expect(rpc).toHaveBeenCalledWith('admit_waitlist', {
      p_email: 'member@example.com',
      p_ip_fingerprint: expect.stringMatching(/^[0-9a-f]{64}$/)
    })
    expect(JSON.stringify(rpc.mock.calls)).not.toContain('203.0.113.9')
  })

  it('maps durable atomic duplicate and rate decisions without leaking PII', async () => {
    rpc.mockResolvedValueOnce({ data: 'duplicate', error: null })
      .mockResolvedValueOnce({ data: 'rate_limited', error: null })
    expect((await POST(request('same@example.com'))).status).toBe(409)
    const limited = await POST(request('other@example.com'))
    expect(limited.status).toBe(429)
    expect(JSON.stringify(await limited.json())).not.toContain('other@example.com')
  })

  it('fails closed on storage outage', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '08006' } })
    const response = await POST(request())
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('delegates concurrent admissions to the single atomic database RPC', async () => {
    rpc.mockResolvedValueOnce({ data: 'admitted', error: null })
      .mockResolvedValueOnce({ data: 'daily_limited', error: null })
    const [first, second] = await Promise.all([
      POST(request('first@example.com', '198.51.100.5')),
      POST(request('second@example.com', '198.51.100.5'))
    ])
    expect([first.status, second.status].sort()).toEqual([201, 429])
    expect(rpc).toHaveBeenCalledTimes(2)
  })

  it('returns an exact count only when storage succeeds', async () => {
    from.mockReturnValue({ select: vi.fn().mockResolvedValue({ count: 7, error: null }) })
    await expect((await GET()).json()).resolves.toEqual({ count: 7 })
  })
})
