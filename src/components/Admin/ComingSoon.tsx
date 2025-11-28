"use client"

import Link from "next/link"
import { Clock } from "lucide-react"

export default function ComingSoon({ feature }: { feature?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-4 px-4">
      <Clock className="w-12 h-12 text-gray-500" />
      <h2 className="text-2xl font-semibold">
        {feature ? `${feature} feature is coming soon!` : "This feature is coming soon!"}
      </h2>
      <p className="text-muted-foreground max-w-md">
        This feature is not yet available in the Admin Panel.  
        You can manage it directly from{" "}
        <Link href="/auraone-studio" className="font-medium text-primary underline">
          Sanity Studio
        </Link>.
      </p>
    </div>
  )
}