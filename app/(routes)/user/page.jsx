"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Building2, LogOut, Mail } from 'lucide-react'
import UserListing from './_components/UserListing'

function User() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/sign-in')
      }
    }
    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  if (!user) return null

  return (
    <div className='max-w-4xl mx-auto my-6 px-4 sm:px-6 lg:px-8'>
      <h2 className='font-bold text-3xl mb-6'>Welcome, {user.phone}</h2>
      <div className='bg-white shadow rounded-lg p-6 mb-6'>
        <h3 className='font-semibold text-xl mb-4'>Profile Information</h3>
        <div className='flex items-center mb-4'>
          <Mail className='h-5 w-5 mr-2 text-gray-500' />
          <p>{user.phone}</p>
        </div>
        <button
          onClick={handleSignOut}
          className='flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
        >
          <LogOut className='h-5 w-5 mr-2' />
          Sign Out
        </button>
      </div>
      <div className='bg-white shadow rounded-lg p-6'>
        <h3 className='font-semibold text-xl mb-4 flex items-center'>
          <Building2 className='h-6 w-6 mr-2 text-gray-500' />
          My Listing
        </h3>
        <UserListing />
      </div>
    </div>
  )
}

export default User
