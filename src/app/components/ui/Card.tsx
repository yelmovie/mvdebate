import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  hoverable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white shadow-soft',
  elevated: 'bg-white shadow-medium',
  outlined: 'bg-white border-2 border-border',
};

export function Card({
  children,
  variant = 'default',
  hoverable = false,
  selected = false,
  onClick,
  className = '',
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        transition-all duration-200
        ${variantStyles[variant]}
        ${hoverable ? 'hover:shadow-strong hover:-translate-y-1 cursor-pointer' : ''}
        ${selected ? 'ring-2 ring-primary shadow-strong' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-border ${className}`}>
      {children}
    </div>
  );
}
