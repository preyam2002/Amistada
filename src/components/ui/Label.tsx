import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      children,
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium text-[#D1D5DB]",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-[#EF4444] ml-1">*</span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
