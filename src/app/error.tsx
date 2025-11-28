'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg px-4'>
      <div className='p-8 rounded-md shadow-md max-w-md w-full text-center'>
        <h2 className='text-2xl font-semibold text-destructive mb-2'>Something went wrong!</h2>
        <p className='text-accent-foreground mb-6'>
          An unexpected error has occurred. Please try again.
        </p>
        <Button onClick={reset} className='w-full'>
          Try Again
        </Button>
      </div>
    </div>
  )
}