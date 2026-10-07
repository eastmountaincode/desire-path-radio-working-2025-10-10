export const proposalCaptchaAction = 'show-proposal'

export const proposalFields = [
  'firstName', 'lastName', 'email', 'phone', 'showName', 'location',
  'category', 'frequency', 'oneLiner', 'fullDescription',
  'relevantExperience', 'howDidYouHear', 'anythingElse',
] as const

export type ShowProposal = Record<(typeof proposalFields)[number], string>

export const emptyProposal: ShowProposal = Object.fromEntries(
  proposalFields.map(field => [field, ''])
) as ShowProposal

const requiredFields = new Set<string>([
  'firstName', 'lastName', 'email', 'showName', 'location',
  'category', 'frequency', 'oneLiner', 'fullDescription',
])

export function parseProposal(input: unknown): ShowProposal | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const values = input as Record<string, unknown>
  const proposal = { ...emptyProposal }
  for (const field of proposalFields) {
    const value = values[field] ?? ''
    if (typeof value !== 'string') return null
    const limit = ['fullDescription', 'relevantExperience', 'anythingElse'].includes(field) ? 20000 : 1000
    if (value.length > limit || (requiredFields.has(field) && !value.trim())) return null
    proposal[field] = value.trim()
  }
  if (proposal.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(proposal.email)) return null
  if (/[\r\n]/.test(proposal.showName)) return null
  return proposal
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!)
}
