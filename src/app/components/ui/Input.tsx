import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-2xl
              px-4 py-3
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              bg-white border-2 border-border
              text-text-primary placeholder:text-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="mt-2 text-sm text-text-secondary">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full rounded-2xl
            px-4 py-3
            bg-white border-2 border-border
            text-text-primary placeholder:text-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {error}
          </p>
        )}
        {helper && !error && (
          <p className="mt-2 text-sm text-text-secondary">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
