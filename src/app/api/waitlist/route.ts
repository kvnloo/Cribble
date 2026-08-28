import { createHmac } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabaseServer'

const supabase = createServiceClient()

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const rateSecret = process.env.WAITLIST_RATE_LIMIT_SECRET
  return Boolean(url && key && rateSecret && !url.includes('placeholder') && url !== 'undefined')
}

function unavailable() {
  return NextResponse.json({ error: 'Service unavailable' }, {
    status: 503,
    headers: { 'Cache-Control': 'no-store' }
  })
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 &&
    !email.includes('..') && !email.startsWith('.') && !email.endsWith('.')
}

const disposable = new Set([
  '10minutemail.com', 'guerrillamail.com', 'tempmail.org', 'mailinator.com',
  'throwaway.email', 'temp-mail.org', 'mohmal.com', 'sharklasers.com',
  'yopmail.com', 'maildrop.cc', 'trashmail.com', 'getnada.com'
])

function clientAddress(request: NextRequest) {
  // Trust only the first address inserted by the deployment proxy.
  return (request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') || 'unknown').trim()
}

export async function POST(request: NextRequest) {
  let email: unknown
  try {
    const body: unknown = await request.json()
    email = body && typeof body === 'object' && 'email' in body ? body.email : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof email !== 'string' || !validEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }
  const normalized = email.trim().toLowerCase()
  const domain = normalized.split('@')[1]
  if (disposable.has(domain) || domain.includes('temp') || domain.includes('trash')) {
    return NextResponse.json({ error: 'Disposable email addresses are not allowed' }, { status: 400 })
  }
  if (!isConfigured()) return unavailable()

  const fingerprint = createHmac('sha256', process.env.WAITLIST_RATE_LIMIT_SECRET!)
    .update(clientAddress(request)).digest('hex')

  try {
    const { data, error } = await supabase.rpc('admit_waitlist', {
      p_email: normalized,
      p_ip_fingerprint: fingerprint
    })
    if (error) {
      console.error('Waitlist admission unavailable:', error.code || 'storage_error')
      return unavailable()
    }
    if (data === 'rate_limited' || data === 'daily_limited') {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
    if (data === 'duplicate') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    if (data !== 'admitted') return unavailable()
    return NextResponse.json({ message: 'Successfully added to waitlist' }, { status: 201 })
  } catch (error) {
    console.error('Waitlist admission unavailable:', error instanceof Error ? error.name : 'storage_error')
    return unavailable()
  }
}

export async function GET() {
  if (!isConfigured()) return unavailable()
  try {
    const { count, error } = await supabase.from('waitlist').select('id', { count: 'exact', head: true })
    if (error) return unavailable()
    return NextResponse.json({ count })
  } catch {
    return unavailable()
  }
}
