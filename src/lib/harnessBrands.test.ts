import { describe, expect, it } from 'vitest'
import { harnessBrand, harnessImageSource, normalizeHarnessId } from './harnessBrands'
import { tokenAgentLabel } from './tokenLeaderboard'

describe('harness brand registry', () => {
  it.each(['pi', 'pi-agent', 'pi-coding-agent', ' PI_CODING_AGENT '])(
    'normalizes the Pi alias %s',
    (alias) => {
      expect(tokenAgentLabel(alias)).toBe('Pi')
      expect(harnessBrand(alias)?.imageSrc).toBe('/agents/pi.svg')
    }
  )

  it.each(['opencode', 'open-code', ' Open_Code '])('normalizes the OpenCode alias %s', (alias) => {
    expect(tokenAgentLabel(alias)).toBe('OpenCode')
    expect(harnessBrand(alias)?.imageSrc).toBe('/agents/opencode.svg')
  })

  it('preserves the existing Hermes aliases and mark', () => {
    expect(harnessBrand('hermes')).toEqual({ label: 'Hermes', imageSrc: '/agents/hermes.png' })
    expect(harnessBrand('hermes-agent')).toEqual(harnessBrand('hermes'))
  })

  it('keeps unknown harness labels deterministic without inventing a brand asset', () => {
    expect(normalizeHarnessId('  New_Harness  ')).toBe('new-harness')
    expect(tokenAgentLabel('  New_Harness  ')).toBe('New Harness')
    expect(harnessBrand('new-harness')).toBeNull()
    expect(harnessImageSource(harnessBrand('new-harness'), null)).toBeNull()
  })

  it('falls back only after the selected image source fails', () => {
    const pi = harnessBrand('pi')
    expect(harnessImageSource(pi, null)).toBe('/agents/pi.svg')
    expect(harnessImageSource(pi, '/agents/opencode.svg')).toBe('/agents/pi.svg')
    expect(harnessImageSource(pi, '/agents/pi.svg')).toBeNull()
  })
})
