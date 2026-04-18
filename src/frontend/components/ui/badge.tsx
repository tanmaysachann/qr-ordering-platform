import { cn } from "@/shared/utils/cn";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "veg" | "nonveg";
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  veg: "bg-green-100 text-green-700 border border-green-300",
  nonveg: "bg-red-100 text-red-700 border border-red-300",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
