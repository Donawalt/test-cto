import type { CardProps } from '@myapp/types';

const variantClasses = {
  default: 'bg-primary-500',
  bordered: 'bg-primary-500 border border-secondary-200',
  elevated: 'bg-primary-500 shadow-md',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
