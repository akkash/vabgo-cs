"use client"
import { Button } from '@/components/ui/button'
import { Plus, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '../contexts/AuthContext'
import { X } from 'lucide-react';

function Header() {
  const path = usePathname();
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  }

  const handleListProperty = () => {
    if (user) {
      setShowDialog(true);
    } else {
      router.push('/sign-in');
    }
  }

  const handleOptionSelect = (option) => {
    setShowDialog(false);
    if (option === 'whatsapp') {
      // Redirect to WhatsApp link
      window.open('https://wa.me/919677602828', '_blank'); // Open WhatsApp chat
    } else {
      router.push('/add-new-listing');
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
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <button 
              onClick={() => setShowDialog(false)} 
              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-4">Choose an Option</h2>

            <div className="flex items-center gap-4 mb-4 p-4 border rounded-lg">
              <div onClick={() => handleOptionSelect('page')} className="block w-full text-center bg-blue-500 text-white py-2 rounded cursor-pointer">
                Add Your Property
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <span>or</span>
            </div>
            
            <div className="flex items-center gap-4 mb-4 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Phone className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">Call us on</div>
                <div className="font-semibold">
                  <a href="tel:+919677602828" className="text-blue-500 hover:underline">+91-9677602828</a>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <span>or</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <img 
                  src="/whatsapp_icon.png" 
                  alt="WhatsApp" 
                  className="h-6 w-6"
                />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">Scan the QR Code to</div>
                <div className="font-semibold">Post Via WhatsApp</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
