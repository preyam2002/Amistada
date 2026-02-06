import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: "bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20",
      secondary: "bg-[#FB7185]/10 text-[#FB7185] border border-[#FB7185]/20",
      success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      error: "bg-red-500/10 text-red-400 border border-red-500/20",
      outline: "bg-transparent text-[#9CA3AF] border border-[#A78BFA]/30",
    };
    
    const sizeStyles = {
      sm: "px-2 py-0.5 text-xs rounded-md",
      md: "px-3 py-1 text-sm rounded-lg",
      lg: "px-4 py-1.5 text-base rounded-xl",
    };

    if (dot) {
      return (
        <span
          ref={ref}
          className={cn(
            "inline-flex items-center gap-2",
            className
          )}
          {...props}
        >
          <span className={cn(
            "w-2 h-2 rounded-full",
            variantStyles[variant].split(" ")[0]
          )} />
          <span className={cn("font-medium", sizeStyles[size])}>
            {children}
          </span>
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
