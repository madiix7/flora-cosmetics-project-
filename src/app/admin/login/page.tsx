import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function AdminLoginPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_session')?.value === 'authenticated') {
    redirect('/admin')
  }
  return <LoginForm />
}
