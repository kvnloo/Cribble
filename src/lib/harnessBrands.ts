export interface HarnessBrand {
  label: string
  imageSrc?: string
}

/**
 * Collector IDs and their presentation metadata. Keep harness identity here;
 * model/provider names deliberately do not belong in this registry.
 */
export const HARNESS_BRANDS: Record<string, HarnessBrand> = {
  claude: { label: 'Claude Code' },
  'claude-code': { label: 'Claude Code' },
  codex: { label: 'Codex' },
  'openai-codex': { label: 'Codex' },
  cursor: { label: 'Cursor' },
  gemini: { label: 'Gemini CLI' },
  'gemini-cli': { label: 'Gemini CLI' },
  copilot: { label: 'GitHub Copilot' },
  'github-copilot': { label: 'GitHub Copilot' },
  hermes: { label: 'Hermes', imageSrc: '/agents/hermes.png' },
  'hermes-agent': { label: 'Hermes', imageSrc: '/agents/hermes.png' },
  opencode: { label: 'OpenCode', imageSrc: '/agents/opencode.svg' },
  'open-code': { label: 'OpenCode', imageSrc: '/agents/opencode.svg' },
  pi: { label: 'Pi', imageSrc: '/agents/pi.svg' },
  'pi-agent': { label: 'Pi', imageSrc: '/agents/pi.svg' },
  'pi-coding-agent': { label: 'Pi', imageSrc: '/agents/pi.svg' }
}

export function normalizeHarnessId(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_]+/g, '-')
}

export function harnessBrand(value: string | null): HarnessBrand | null {
  if (!value) return null
  return HARNESS_BRANDS[normalizeHarnessId(value)] ?? null
}

/** The source to render, or null after that exact source failed to load. */
export function harnessImageSource(brand: HarnessBrand | null, failedSrc: string | null): string | null {
  const src = brand?.imageSrc ?? null
  return src && src !== failedSrc ? src : null
}
