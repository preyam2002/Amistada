import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered" | "glass";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: "bg-[#0B1020] border border-[#A78BFA]/10",
      elevated: "bg-[#0B1020] border border-[#A78BFA]/10 shadow-xl shadow-[#0B1020]/20",
      bordered: "bg-transparent border-2 border-[#A78BFA]/20",
      glass: "bg-[#0B1020]/80 backdrop-blur-md border border-[#A78BFA]/20",
    };
    
    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
