import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminUploads() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'
  
  if (!isAuthenticated) {
    redirect('/admin')
  }

  return (
    <div className="p-6 border border-blue-500">
      <h1 className="text-2xl mb-4">Upload Episodes</h1>
      <p>Upload functionality coming soon...</p>
    </div>
  )
}

