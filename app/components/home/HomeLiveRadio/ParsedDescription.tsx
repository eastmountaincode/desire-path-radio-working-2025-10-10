/**
 * ParsedDescription Component
 *
 * Parses description text for custom commands in {{command}} format.
 * This is a workaround for evenings.fm not supporting newlines in descriptions.
 *
 * Currently supported commands:
 * - {{newline}} - inserts a paragraph break (two line breaks)
 * - {{social:instagram:handle}} - inserts an Instagram link
 *
 * Future commands can be added to the switch statement below.
 */

interface ParsedDescriptionProps {
    text: string
    className?: string
}

// Helper function to generate social media URLs
function getSocialUrl(platform: string, handle: string): string | null {
    // Remove @ if present
    const cleanHandle = handle.replace(/^@/, '')

    if (platform === 'instagram') {
        return `https://instagram.com/${cleanHandle}`
    }

    return null
}

export default function ParsedDescription({ text, className }: ParsedDescriptionProps) {
    if (!text) return null

    // Split by command pattern {{...}}
    const parts = text.split(/({{[^}]+}})/)

    const parsedContent = parts.map((part, index) => {
        // Check if this part is a command
        const commandMatch = part.match(/^{{(.+)}}$/)

        if (commandMatch) {
            const commandText = commandMatch[1].toLowerCase().trim()

            // Check for social command pattern: social:platform:handle
            const socialMatch = commandText.match(/^social:([^:]+):(.+)$/)

            if (socialMatch) {
                const platform = socialMatch[1].trim()
                const handle = socialMatch[2].trim()
                const url = getSocialUrl(platform, handle)

                if (url) {
                    return (
                        <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center hover:opacity-70"
                        >
                            <i className="fi fi-brands-instagram text-base"></i>
                        </a>
                    )
                }
                // If platform not recognized, return raw text
                return part
            }

            switch (commandText) { 
                case 'newline':
                    // Two line breaks for paragraph separation
                    return <span key={index}><br /><br /></span>
                default:
                    // Unknown command - just return the raw text
                    return part
            }
        }

        // Regular text
        return part
    })

    return <p className={className}>{parsedContent}</p>
}
