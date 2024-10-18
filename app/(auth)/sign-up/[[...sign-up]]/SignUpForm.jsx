'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function SignUpForm() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [error, setError] = useState(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    })
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: 'sms'
    })
    if (error) {
      setError(error.message)
    } else {
      router.push('/')
    }
  }

  return (
    <>
      {step === 'phone' ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="987654321"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Verify OTP
          </button>
        </form>
      )}
    </>
  )
}