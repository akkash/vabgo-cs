import SignInForm from './SignInForm'

export function generateStaticParams() {
  return [
    { 'sign-in': [] },
    { 'sign-in': [''] }
  ]
}

export default function Page() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{backgroundImage: "url('/warehouse.jpg')"}}>
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        <SignInForm />
        <p className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?
          <a href="/sign-up" className="text-blue-600 hover:underline ml-1">Sign up</a>.
        </p>
      </div>
    </section>
  )
}
