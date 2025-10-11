import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EpisodeUploadForm from '@/app/components/admin/EpisodeUploadForm/EpisodeUploadForm'

export default async function AdminUploads() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'
  
  if (!isAuthenticated) {
    redirect('/admin')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-6">Upload An Episode To The Archive</h1>
      <EpisodeUploadForm />
    </div>
  )
}

