type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }

function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = []
  const lines = markdown.split(/\r?\n/)
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    const text = paragraph.map((l) => l.trimStart()).join('\n').trim()
    if (text.length > 0) {
      blocks.push({ type: 'paragraph', text })
    }
    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.startsWith('## ')) {
      flushParagraph()
      blocks.push({ type: 'heading', text: line.slice(3).trim() })
      continue
    }

    if (line.trim() === '') {
      flushParagraph()
      continue
    }

    paragraph.push(line)
  }

  flushParagraph()

  return blocks
}

export default function MarkdownContent({ text }: { text: string }) {
  const blocks = parseBlocks(text)

  return (
    <div>
      {blocks.map((block, i) =>
        block.type === 'heading' ? (
          <h2
            key={i}
            className="text-2xl font-bold mb-4 mt-12 first:mt-0 font-[family-name:var(--font-monument-wide)]"
          >
            {block.text}
          </h2>
        ) : (
          <p key={i} className="mb-4 whitespace-pre-wrap">
            {block.text}
          </p>
        )
      )}
    </div>
  )
}
