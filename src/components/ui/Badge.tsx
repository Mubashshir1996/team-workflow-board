import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { badgeVariants } from '@/components/ui/badge.variants'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
export type { BadgeProps }
