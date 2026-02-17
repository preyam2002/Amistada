import { HTMLAttributes, forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "gradient" | "rounded";
  name?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = "",
      size = "md",
      variant = "default",
      name,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      xs: "w-6 h-6 text-[10px]",
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
      xl: "w-16 h-16 text-lg",
    };

    const variantStyles = {
      default: "bg-[#1F2937]",
      gradient: "bg-gradient-to-br from-[#A78BFA] to-[#FB7185]",
      rounded: "rounded-full",
    };

    const initials = name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center flex-shrink-0",
          variantStyles[variant],
          sizeStyles[size],
          variant === "default" && "rounded-lg",
          className
        )}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100%"
            className={cn(
              "object-cover",
              variant === "rounded" && "rounded-full"
            )}
          />
        ) : initials ? (
          <span className="font-bold text-white">
            {initials}
          </span>
        ) : (
          <User className="text-[#9CA3AF]" size={size === "xs" ? 12 : size === "sm" ? 16 : size === "lg" ? 24 : 20} />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
