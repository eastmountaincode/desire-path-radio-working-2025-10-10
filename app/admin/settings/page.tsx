import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClearDatabaseButton from '@/app/components/admin/ClearDatabaseButton/ClearDatabaseButton'

// Force dynamic rendering to check authentication on every request
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
        redirect('/admin')
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-6">Settings</h1>

            <div className="max-w-2xl space-y-6">
                <ClearDatabaseButton />
            </div>
        </div>
    )
}