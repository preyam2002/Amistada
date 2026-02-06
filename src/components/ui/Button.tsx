import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050814] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";
    
    const variantStyles = {
      primary: "bg-gradient-to-r from-[#A78BFA] to-[#FB7185] text-white hover:opacity-90 hover:shadow-lg hover:shadow-[#A78BFA]/20 focus:ring-[#A78BFA] active:scale-[0.98]",
      secondary: "bg-[#1F2937] text-white hover:bg-[#374151] hover:shadow-lg focus:ring-[#A78BFA] active:scale-[0.98]",
      outline: "border border-[#A78BFA]/30 text-[#A78BFA] hover:bg-[#A78BFA]/10 hover:border-[#A78BFA]/50 focus:ring-[#A78BFA] active:scale-[0.98]",
      ghost: "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937]/50 focus:ring-[#A78BFA] active:scale-[0.98]",
      destructive: "bg-[#EF4444] text-white hover:bg-[#DC2626] hover:shadow-lg hover:shadow-[#EF4444]/20 focus:ring-[#EF4444] active:scale-[0.98]",
    };
    
    const sizeStyles = {
      xs: "px-2 py-1 text-xs rounded-md",
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-4 py-2 text-sm rounded-xl",
      lg: "px-6 py-2.5 text-base rounded-xl",
      xl: "px-8 py-3 text-lg rounded-xl",
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0 4.411 3.589 8 8 8s8-3.589 8-8c0-2.87-1.065-5.358-2.709-7.291z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
