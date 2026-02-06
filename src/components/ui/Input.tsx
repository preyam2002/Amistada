import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error = false,
      fullWidth = false,
      startIcon,
      endIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "flex items-center w-full rounded-xl transition-all duration-200 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    
    const inputStyles = {
      default: "bg-[#1F2937] border border-[#A78BFA]/20 text-[#F9FAFB] placeholder:text-[#9CA3AF]/50 focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 focus:ring-offset-2 focus:ring-offset-[#050814]",
      error: "bg-[#1F2937] border border-[#EF4444] text-[#F9FAFB] placeholder:text-[#9CA3AF]/50 focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 focus:ring-offset-2 focus:ring-offset-[#050814]",
    };
    
    return (
      <div className={cn(
        "relative flex items-center",
        fullWidth ? "w-full" : "",
        className
      )}>
        <input
          ref={ref}
          type={type}
          className={cn(
            baseStyles,
            inputStyles[error ? "error" : "default"],
            "w-full px-4 py-3 text-sm",
            startIcon && "pl-10",
            endIcon && "pr-10"
          )}
          disabled={disabled}
          {...props}
        />
        {startIcon && (
          <span className="absolute left-3 text-[#9CA3AF] pointer-events-none">
            {startIcon}
          </span>
        )}
        {endIcon && (
          <span className="absolute right-3 text-[#9CA3AF] pointer-events-none">
            {endIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
