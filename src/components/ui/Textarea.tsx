import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error = false,
      fullWidth = true,
      rows = 3,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "flex items-center w-full rounded-xl transition-all duration-200 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none";
    
    const textareaStyles = {
      default: "bg-[#1F2937] border border-[#A78BFA]/20 text-[#F9FAFB] placeholder:text-[#9CA3AF]/50 focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 focus:ring-offset-2 focus:ring-offset-[#050814]",
      error: "bg-[#1F2937] border border-[#EF4444] text-[#F9FAFB] placeholder:text-[#9CA3AF]/50 focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 focus:ring-offset-2 focus:ring-offset-[#050814]",
    };
    
    return (
      <div className={cn(fullWidth ? "w-full" : "", className)}>
        <textarea
          ref={ref}
          className={cn(
            baseStyles,
            textareaStyles[error ? "error" : "default"],
            "px-4 py-3 text-sm",
            fullWidth && "w-full"
          )}
          rows={rows}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
