import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "primary" | "danger";
  active?: boolean;
  icon?: React.ReactNode;
  tooltip?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "ghost",
  active = false,
  className = "",
  icon,
  children,
  tooltip,
  ...props
}) => {
  const baseStyles =
    "flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    ghost: `text-slate-600 hover:bg-slate-200 hover:text-slate-900 ${
      active ? "bg-slate-200 text-slate-900" : ""
    }`,
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    danger: "text-red-500 hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      title={tooltip}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
};
