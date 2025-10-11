import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminLoginForm from '../components/admin/AdminLoginForm'

// Force dynamic rendering to check authentication on every request
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

  // Check authentication on server - don't send admin content to client if not authenticated
  if (!isAuthenticated) {
    return <AdminLoginForm />
  }

  // Redirect to dashboard if authenticated
  redirect('/admin/dashboard')
}

