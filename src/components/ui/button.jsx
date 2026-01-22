import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        danger: "bg-red-500 text-white hover:bg-red-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        info: "bg-blue-500 text-white hover:bg-blue-600",
        success: "bg-green-500 text-white hover:bg-green-600",
        purple: "bg-purple-500 text-white hover:bg-purple-600",
        pink: "bg-pink-500 text-white hover:bg-pink-600",
        orange: "bg-orange-500 text-white hover:bg-orange-600",
        cyan: "bg-cyan-500 text-white hover:bg-cyan-600",
        lime: "bg-lime-500 text-white hover:bg-lime-600",
        teal: "bg-teal-500 text-white hover:bg-teal-600",
        indigo: "bg-indigo-500 text-white hover:bg-indigo-600",
        violet: "bg-violet-500 text-white hover:bg-violet-600",
        fuchsia: "bg-fuchsia-500 text-white hover:bg-fuchsia-600",
        rose: "bg-rose-500 text-white hover:bg-rose-600",
        slate: "bg-slate-500 text-white hover:bg-slate-600",
        gray: "bg-gray-500 text-white hover:bg-gray-600",
        zinc: "bg-zinc-500 text-white hover:bg-zinc-600",
        neutral: "bg-neutral-500 text-white hover:bg-neutral-600",
        stone: "bg-stone-500 text-white hover:bg-stone-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
