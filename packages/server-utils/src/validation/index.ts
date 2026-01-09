import { z, ZodSchema } from 'zod';
import { createValidationError } from '../error';

export function validateRequestBody<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    
    throw createValidationError('Request validation failed', errors);
  }
  
  return result.data;
}

export function createValidationErrorFromZod(error: z.ZodError): ReturnType<typeof createValidationError> {
  const errors = error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
  
  return createValidationError('Validation failed', errors);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
}

export function validateField(
  value: unknown,
  rules: ValidationRules
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push('This field is required');
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength}`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength}`);
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push('Invalid format');
    }
  }

  if (rules.custom && !rules.custom(value)) {
    errors.push('Custom validation failed');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
