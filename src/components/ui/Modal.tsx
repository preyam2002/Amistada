"use client";

import { HTMLAttributes, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  size = "md",
  showClose = true,
  className,
  children,
  ...props
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] h-[90vh]",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full bg-[#0B1020] border border-[#A78BFA]/20 rounded-2xl shadow-2xl shadow-[#0B1020]/50",
          sizeStyles[size],
          size === "full" ? "flex flex-col" : "",
          "animate-in zoom-in-95",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors p-2 rounded-lg hover:bg-[#1F2937]"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
