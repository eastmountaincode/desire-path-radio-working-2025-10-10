import MarkdownIt from 'markdown-it'

// Raw HTML stays escaped. Images belong in the existing photo field, not descriptions.
const markdown = new MarkdownIt({ html: false, breaks: true }).disable('image')
markdown.validateLink = url => /^(https?:|mailto:)/i.test(url) || /^(\/[^/]|#|\.\.?\/)/.test(url)

export default function ShopDescription({ text }: { text: string }) {
  return <div className="break-words [&_p]:whitespace-pre-wrap [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mb-4 [&_ol]:mb-4 [&_ul:last-child]:mb-0 [&_ol:last-child]:mb-0 [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_blockquote]:pl-4 [&_blockquote]:border-l [&_pre]:whitespace-pre-wrap"
    dangerouslySetInnerHTML={{ __html: markdown.render(text) }} />
}
