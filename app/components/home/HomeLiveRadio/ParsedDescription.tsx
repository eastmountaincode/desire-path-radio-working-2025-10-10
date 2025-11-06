/**
 * ParsedDescription Component
 *
 * Parses description text for custom commands in {{command}} format.
 * This is a workaround for evenings.fm not supporting newlines in descriptions.
 *
 * Currently supported commands:
 * - {{newline}} - inserts a paragraph break (two line breaks)
 *
 * Future commands can be added to the switch statement below.
 */

interface ParsedDescriptionProps {
    text: string
    className?: string
}

export default function ParsedDescription({ text, className }: ParsedDescriptionProps) {
    if (!text) return null

    // Split by command pattern {{...}}
    const parts = text.split(/({{[^}]+}})/)

    const parsedContent = parts.map((part, index) => {
        // Check if this part is a command
        const commandMatch = part.match(/^{{(.+)}}$/)

        if (commandMatch) {
            const command = commandMatch[1].toLowerCase().trim()

            switch (command) {
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
