import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PlayCountAnalytics from '@/app/components/admin/PlayCountAnalytics/PlayCountAnalytics'

// Force dynamic rendering to check authentication on every request
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
        redirect('/admin')
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-6">Analytics</h1>
            <PlayCountAnalytics />
        </div>
    )
}