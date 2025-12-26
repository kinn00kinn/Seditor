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
    "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    ghost: cn(
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      active && "bg-slate-200 text-slate-900 font-semibold"
    ),
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-transparent",
    danger: "text-red-500 hover:bg-red-50 hover:text-red-700",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={cn(baseStyles, variants[variant], className)}
      title={tooltip}
      {...(props as any)} // Cast to any to avoid complex type intersection issues with framer-motion
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </motion.button>
  );
};
