import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-orion-blue text-text-inverse font-display font-bold shadow-brand hover:bg-orion-blue-hover hover:-translate-y-px hover:shadow-[0_0_28px_rgba(45,107,228,0.45)]",
        secondary:
          "bg-bg-elevated border border-border-default text-text-primary hover:border-border-brand hover:bg-bg-surface",
        ghost:
          "bg-transparent border border-border-subtle text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
        destructive:
          "border border-alert-red text-alert-red hover:bg-alert-red hover:text-white",
        "pro-badge":
          "text-white font-bold shadow-[0_0_20px_var(--color-nebula-purple-glow)]",
        outline:
          "border border-border-default bg-transparent hover:bg-bg-elevated hover:text-text-primary text-text-secondary",
        link: "text-orion-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-3 text-[15px] rounded-[var(--radius-md)]",
        sm: "h-9 px-4 py-2 text-[13px] rounded-[var(--radius-md)]",
        lg: "h-12 px-8 py-3 text-base rounded-[var(--radius-md)]",
        icon: "h-10 w-10 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const extraStyle: React.CSSProperties = {
      transition: "all var(--transition-base)",
      ...style,
    };
    if (variant === "destructive") {
      extraStyle.background = "var(--color-alert-red-bg)";
    }
    if (variant === "pro-badge") {
      extraStyle.background = "linear-gradient(135deg, var(--color-orion-blue), var(--color-nebula-purple))";
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={extraStyle}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
