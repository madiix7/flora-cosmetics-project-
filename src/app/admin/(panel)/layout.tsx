import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata: Metadata = { title: 'Flora Admin' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value

  if (session !== 'authenticated') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-8 lg:p-10">{children}</main>
    </div>
  )
}
