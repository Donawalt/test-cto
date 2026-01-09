import type { InputProps } from '@myapp/types';

export function Input({
  type = 'text',
  label,
  placeholder,
  error,
  disabled = false,
  value,
  onChange,
  onBlur,
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-2 rounded-md border
          ${error
            ? 'border-danger-500 focus:border-danger-600 focus:ring-danger-500'
            : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
          }
          ${disabled ? 'bg-secondary-100 cursor-not-allowed' : 'bg-white'}
          focus:outline-none focus:ring-2 transition-colors duration-200
        `}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
}
