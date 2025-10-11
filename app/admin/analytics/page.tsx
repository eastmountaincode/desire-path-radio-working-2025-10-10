import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
        redirect('/admin')
    }

    return (
        <div className="p-6 border border-purple-500">
            <h1 className="text-2xl mb-4">Analytics</h1>
        </div>
    )
}