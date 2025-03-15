import { SignOutButton } from '@/components/global/SignOutButton'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const Dashboard = async () => {
  const supabase = await createClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    // Redirect the user to the login page if not authenticated
    redirect('/login')
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      
      <div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>UID:</strong> {user.id}</p>
        {user.user_metadata?.full_name && (
          <p><strong>Name:</strong> {user.user_metadata.full_name}</p>
        )}
      </div>

      <div className="mt-4">
        <SignOutButton />
      </div>
    </div>
  )
}

export default Dashboard
