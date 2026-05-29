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
                    <h2 className="text-2xl mb-4 font-[family-name:var(--font-monument-wide)]">Live Radio Description Formatting</h2>

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
                            <h3 className="text-lg mb-2 font-[family-name:var(--font-monument)]">Channel Indicators</h3>
                            <p className="mb-2 text-sm">
                                Add a channel tag to the Evenings.fm description when a live show should display
                                the Channel 1 or Channel 2 indicator on the home page. The tag is only used by the
                                website and will be hidden from the public description.
                            </p>

                            <div className="p-4 border border-current">
                                <p className="text-sm font-mono mb-2">Examples:</p>
                                <code className="text-xs block mb-1">
                                    Today&apos;s live set description {'{{channel:1}}'}
                                </code>
                                <code className="text-xs block">
                                    Today&apos;s live talk description {'{{channel:2}}'}
                                </code>
                            </div>

                            <div className="mt-4 p-4 border border-current">
                                <p className="text-sm font-mono mb-2">Behavior:</p>
                                <p className="text-xs">
                                    If the description does not include one of these tags, the show still plays normally
                                    and both channel indicators appear unfilled. Use the tag to fill the correct channel
                                    indicator with DPR orange.
                                </p>
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
