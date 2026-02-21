import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-primary text-white shadow-medium hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-text-primary hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-medium hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed',
  success: 'bg-gradient-secondary text-white shadow-medium hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm min-w-[36px]',
  md: 'h-11 px-6 text-base min-w-[44px]',
  lg: 'h-13 px-8 text-lg min-w-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
}
