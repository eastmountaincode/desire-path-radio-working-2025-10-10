import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Force dynamic rendering to check authentication on every request
export const dynamic = 'force-dynamic'

export default async function HowToPage() {
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
        redirect('/admin')
    }

    return (
        <div className="p-6 max-w-4xl">
            <h1 className="text-3xl mb-8 font-[family-name:var(--font-monument-wide)]">How To</h1>

            <div className="space-y-8">
                {/* Description Formatting */}
                <section className="border border-current p-6">
                    <h2 className="text-2xl mb-4 font-[family-name:var(--font-monument-wide)]">Live RadioDescription Formatting</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg mb-2 font-[family-name:var(--font-monument)]">Line Breaks</h3>
                            <p className="mb-2 text-sm">
                                Evenings.fm doesn&apos;t support newlines in episode descriptions. To work around this,
                                use the <code className="px-2 py-1">{'{{newline}}'}</code> command
                                to insert paragraph breaks. This goes in the description field on Evenings.fm.
                            </p>

                            <div className="p-4 border border-current">
                                <p className="text-sm font-mono mb-2">Example:</p>
                                <code className="text-xs block">
                                    First paragraph{'{{newline}}'}Second paragraph
                                </code>
                            </div>

                            <div className="mt-4 p-4 border border-current">
                                <p className="text-sm font-mono mb-2">Renders as:</p>
                                <div className="text-xs">
                                    <p>First paragraph</p>
                                    <br />
                                    <p>Second paragraph</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg mb-2 font-[family-name:var(--font-monument)]">Instagram Links</h3>
                            <p className="mb-2 text-sm">
                                Add clickable Instagram links in your descriptions using the{' '}
                                <code className="px-2 py-1">{'{{social:instagram:handle}}'}</code> command.
                                This displays as a clickable Instagram icon that links to the profile.
                            </p>

                            <div className="p-4 border border-current">
                                <p className="text-sm font-mono mb-2">Example:</p>
                                <code className="text-xs block">
                                    {'{{social:instagram:myhandle}}'}
                                </code>
                            </div>

                            <div className="mt-4 p-4 border border-current">
                                <p className="text-sm font-mono mb-2">Renders as:</p>
                                <div className="text-xs">
                                    <p><a href="https://instagram.com/myhandle"><i className="fi fi-brands-instagram"></i></a> (clickable Instagram icon)</p>
                                </div>
                            </div>

                            <div className="mt-4 p-4 border border-current">
                                <p className="text-sm font-mono mb-2">Example:</p>
                                <code className="text-xs block">
                                    Today&apos;s guest is John Doe{'{{newline}}'}Find them on Instagram: {'{{social:instagram:johndoe}}'}
                                </code>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}
