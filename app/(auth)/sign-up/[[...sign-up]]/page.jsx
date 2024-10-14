'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Page() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    })
    if (error) {
      alert(error.message)
    } else {
      setShowOtpInput(true)
      alert('Check your phone for the OTP!')
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otp,
      type: 'sms'
    })
    if (error) {
      alert(error.message)
    } else {
      alert('Phone number verified successfully!')
      router.push('/') // Redirect to  home page
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{backgroundImage: "url('/warehouse.jpg')"}}>
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8">Sign Up</h1>
        {!showOtpInput ? (
          <form onSubmit={handleSendOtp} className="w-full max-w-md">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone Number"
              className="w-full px-3 py-2 mb-4 text-gray-700 border rounded-lg focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="w-full max-w-md">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-3 py-2 mb-4 text-gray-700 border rounded-lg focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
            >
              Verify OTP
            </button>
          </form>
        )}
        <p className="mt-4">
          Already have an account?{' '}
          <a href="/sign-in" className="text-blue-500 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </section>
  )
}
