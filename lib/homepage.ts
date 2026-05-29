export const DEFAULT_HOMEPAGE_TEXT = [
  'Exploratory programming where nature meets culture, for the outdoor community and beyond. Based in New York, streaming earth-wide.',
  'Music from the underground. Talk, education, documentary, experimental, archival from the field.',
].join('\n\n')

export function getHomepageParagraphs(text: string) {
  return text
    .trim()
    .split(/\n\s*\n|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
