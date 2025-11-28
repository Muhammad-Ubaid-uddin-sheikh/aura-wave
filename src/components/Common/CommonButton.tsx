import React from 'react'
import { Button } from '@/components/ui/button'
import { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CommonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  text?: string
  children?: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const CommonButton: React.FC<CommonButtonProps> = ({
  text,
  variant,
  className,
  children,
  onClick,
  ...props
}) => {
  return (
    <Button variant={variant} className={cn(className)} {...props} onClick={onClick}>
      {text || children}
    </Button>
  )
}

export default CommonButton