"use client"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '../contexts/AuthContext'

function Header() {
  const path = usePathname();
  const router = useRouter();
  const { user, supabase } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  }

  const handleListProperty = () => {
    if (user) {
      router.push('/add-new-listing');
    } else {
      router.push('/sign-in');
    }
  }

  return (
    <div className='p-6 px-10 flex justify-between shadow-sm fixed top-0 w-full z-10 bg-white'>
      <div className='flex gap-12 items-center'>
        <Link href={'/'}>
          <Image src={'/logo.svg'} width={150}
            height={150} alt='logo' />
        </Link>
      </div>
      <div className='flex gap-2 items-center'>
        <Button className="flex gap-2" onClick={handleListProperty}>
          <Plus className='h-5 w-5' /> List Your Property
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Image src={user.user_metadata.avatar_url || '/default-avatar.png'} 
                width={35} height={35} alt='user profile'
                className='rounded-full'
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={'/user'}>Profile</Link> 
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={'/user#/my-listing'}>My Listing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href={'/sign-in'}>
            <Button variant="outline">Login</Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default Header
