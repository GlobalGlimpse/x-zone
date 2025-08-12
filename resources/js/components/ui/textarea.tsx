import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-200',
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'
