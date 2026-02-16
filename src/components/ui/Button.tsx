import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "primary" | "danger" | "outline";
  active?: boolean;
  icon?: React.ReactNode;
  tooltip?: string;
}

// Combine Motion props with our Button props, omitting overlapping HTML attributes where necessary
type CombinedProps = ButtonProps & Omit<HTMLMotionProps<"button">, keyof ButtonProps>;

export const Button: React.FC<CombinedProps> = ({
  variant = "ghost",
  active = false,
  className = "",
  icon,
  children,
  tooltip,
  ...props
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    ghost: cn(
      "hover:bg-[rgba(76,79,105,0.1)]",
      active && "bg-[rgba(76,79,105,0.15)] font-semibold"
    ),
    primary:
      "text-white shadow-sm border border-transparent",
    danger: "text-red-500 hover:bg-red-50/50 hover:text-red-700",
    outline: "border hover:bg-[rgba(76,79,105,0.06)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={cn(baseStyles, variants[variant], className)}
      title={tooltip}
      style={
        variant === "primary"
          ? { backgroundColor: "rgb(22, 162, 33)" }
          : variant === "outline"
          ? { borderColor: "var(--background-modifier-border)", color: "var(--text-normal)" }
          : { color: "var(--text-muted)" }
      }
      {...(props as any)}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </motion.button>
  );
};
