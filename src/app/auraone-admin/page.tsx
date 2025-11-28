"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Layers, Users, MessageSquare, Settings, UserCog, Boxes } from "lucide-react"

const features = [
  {
    title: "Orders",
    description: "Manage and track customer orders.",
    href: "/auraone-admin/orders",
    icon: Package,
    available: true,
  },
  {
    title: "Collections",
    description: "Organize products into collections.",
    href: "/auraone-admin/collections",
    icon: Layers,
    available: true,
  },
  {
    title: "Products",
    description: "View and manage product details.",
    href: "/auraone-admin/products",
    icon: Boxes,
    available: false,
  },
  {
    title: "Customers",
    description: "View and manage customer details.",
    href: "/auraone-admin/customers",
    icon: Users,
    available: false,
  },
  {
    title: "Reviews",
    description: "Manage product reviews and ratings.",
    href: "/auraone-admin/reviews",
    icon: MessageSquare,
    available: false,
  },
  {
    title: "Users",
    description: "Manage user accounts and permissions.",
    href: "/auraone-admin/users",
    icon: UserCog,
    available: false,
  },
]

export default function AuraOneAdmin() {
  return (
    <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {features.map((feature, idx) => {
        const Icon = feature.icon
        return (
          <Card
            key={idx}
            className={`transition hover:shadow-lg ${feature.available ? "hover:border-primary cursor-pointer" : "opacity-60"
              }`}
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <Icon className="h-6 w-6 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              {feature.available ? (
                <Link
                  href={feature.href}
                  className="mt-4 inline-block text-sm font-medium text-primary underline"
                >
                  Go to {feature.title}
                </Link>
              ) : (
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  Coming Soon – manage this in{" "}
                  <Link href="/auraone-studio" className="underline text-primary">
                    Sanity Studio
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}