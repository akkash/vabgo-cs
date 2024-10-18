import SignUpForm from './SignUpForm'

export function generateStaticParams() {
  return [
    { 'sign-up': [] },
    { 'sign-up': [''] }
  ]
}

export default function Page() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{backgroundImage: "url('/warehouse.jpg')"}}>
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <SignUpForm />
        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?
          <a href="/sign-in" className="text-blue-600 hover:underline ml-1">Sign in</a>.
        </p>
      </div>
    </section>
  )
}
