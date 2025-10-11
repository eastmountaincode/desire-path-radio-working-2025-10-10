import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ClearCookieButton from '../../components/admin/ClearCookieButton'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'
  
  if (!isAuthenticated) {
    redirect('/admin')
  }

  return (
    <div className="p-6 border border-green-500">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to the admin dashboard</p>
      <ClearCookieButton />
    </div>
  )
}

