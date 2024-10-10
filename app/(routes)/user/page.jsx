"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Building2 } from 'lucide-react'
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
    <div className='my-6 md:px-10 lg:px-32 w-full'>
      <h2 className='font-bold text-2xl py-3'>Profile</h2>
      <div>
        <p>Email: {user.email}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
      <div>
        <h3 className='font-bold text-xl py-2'>My Listing</h3>
        <Building2 className='h-5 w-5' />
        <UserListing />
      </div>
    </div>
  )
}

export default User