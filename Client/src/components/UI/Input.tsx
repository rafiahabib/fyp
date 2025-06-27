import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
  min?: string | number;
  max?: string | number;
  step?: string;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  required = false,
  disabled = false,
  className = '',
  multiline = false,
  rows = 3,
  min,
  max,
  step
}: InputProps) {
  const inputValue = value?.toString() || '';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && !multiline && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        )}
        {multiline ? (
          <textarea
            placeholder={placeholder}
            value={inputValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`
              w-full px-3 py-2.5 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              disabled:bg-gray-100 disabled:cursor-not-allowed
              resize-vertical
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
            `}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={inputValue}
            onChange={onChange}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`
              w-full px-3 py-2.5 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
            `}
          />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}