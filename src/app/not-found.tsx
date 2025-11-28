import Link from 'next/link'
 
export default function NotFound() {
  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4">
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <Link href="/" className="mt-2 inline-block px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover transition-colors duration-300 font-semibold">Return Home</Link>
    </div>
    </>
  )
}