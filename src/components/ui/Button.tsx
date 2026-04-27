import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { buttonVariants } from '@/components/ui/button.variants'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
