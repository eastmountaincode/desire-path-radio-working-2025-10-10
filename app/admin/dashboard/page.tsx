import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClearCookieButton from '../../components/admin/ClearCookieButton'
import ClearChatButton from '../../components/admin/ClearChatButton'
import DatabaseKeepAlive from '../../components/admin/DatabaseKeepAlive/DatabaseKeepAlive'

// Force dynamic rendering to check authentication on every request
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

  if (!isAuthenticated) {
    redirect('/admin')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to the admin dashboard</p>

      <div className="mb-6">
        <DatabaseKeepAlive />
      </div>

      <div className="mb-6">
        <ClearChatButton />
      </div>

      <ClearCookieButton />
    </div>
  )
}

