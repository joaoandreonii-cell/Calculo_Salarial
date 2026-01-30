import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  type?: string;
  step?: string;
  placeholder?: string;
  suffix?: string;
  id: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text", // Default to text to allow formatting characters
  step,
  placeholder = "0,00",
  suffix,
  id
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>
        <input
          type={type}
          inputMode="numeric" // Forces numeric keyboard on mobile
          name={id}
          id={id}
          className="block w-full rounded-md border-slate-300 pl-10 pr-12 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white border outline-none transition-all text-slate-900"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          step={step}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};