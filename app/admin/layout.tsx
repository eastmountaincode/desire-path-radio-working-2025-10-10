import { cookies } from 'next/headers'
import AdminHeader from "../components/admin/AdminHeader"
import AdminSidebar from "../components/admin/AdminSidebar/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1 mt-2">
        {isAuthenticated && <AdminSidebar />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

