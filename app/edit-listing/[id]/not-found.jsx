import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { HomeIcon } from 'lucide-react'
import Image from 'next/image'

export default function ListingNotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">404</h1>
        <Image
          src="/404-illustration.svg"
          alt="404 Illustration"
          width={300}
          height={200}
          className="mx-auto my-6"
          priority
        />
        <h2 className="text-xl font-medium text-muted-foreground">Listing Not Found</h2>
        <p className="max-w-[500px] text-gray-500">
          We couldn't find the listing you're looking for. It may have been removed or doesn't exist.
        </p>
      </div>
      <Link href="/listings">
        <Button variant="default" className="gap-2">
          <HomeIcon className="h-4 w-4" />
          Back to Listings
        </Button>
      </Link>
    </div>
  )
} 