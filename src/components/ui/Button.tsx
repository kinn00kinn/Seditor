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
  disabled,
  ...props
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none select-none cursor-pointer";

  const disabledStyles = "opacity-40 cursor-not-allowed";

  const variants = {
    ghost: cn(
      "hover:bg-[rgba(30,30,46,0.08)]",
      active && "bg-[rgba(30,30,46,0.12)] font-semibold"
    ),
    primary: "text-white shadow-sm",
    danger: "text-red-600 hover:bg-red-50",
    outline: "border hover:bg-[rgba(30,30,46,0.05)]",
  };

  const getStyle = (): React.CSSProperties => {
    if (variant === "primary") {
      return { backgroundColor: "var(--accent)", color: "#fff" };
    }
    if (variant === "outline") {
      return { borderColor: "var(--background-modifier-border)", color: "var(--text-normal)" };
    }
    if (variant === "danger") {
      return {};
    }
    // ghost
    return { color: active ? "var(--text-normal)" : "var(--text-muted)" };
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={cn(baseStyles, variants[variant], disabled && disabledStyles, className)}
      title={tooltip}
      style={getStyle()}
      disabled={disabled}
      {...(props as any)}
    >
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </motion.button>
  );
};
