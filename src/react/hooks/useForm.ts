/**
 * useForm Hook
 * Custom hook for managing form state with validation
 */

'use client';

import { useCallback, useState } from 'react';
import { z, ZodSchema } from 'zod';
import { formatValidationError } from '../../utils/validation';

interface UseFormOptions<T> {
  initialValues: T;
  schema?: ZodSchema;
  onSubmit: (data: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (field: string, value: any) => void;
  resetForm: () => void;
  setFieldError: (field: string, error: string) => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;

      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setValues((prev) => ({
          ...prev,
          [name]: checked,
        }));
      } else if (type === 'number') {
        setValues((prev) => ({
          ...prev,
          [name]: parseFloat(value),
        }));
      } else {
        setValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      }

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setErrors({});

      try {
        // Validate if schema provided
        if (schema) {
          const result = schema.safeParse(values);
          if (!result.success) {
            const formatted = formatValidationError(result.error);
            setErrors(formatted);
            setIsSubmitting(false);
            return;
          }
        }

        // Call submit handler
        await onSubmit(values);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          const formatted = formatValidationError(error);
          setErrors(formatted);
        } else {
          setErrors({ submit: error.message || 'Submission failed' });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, schema, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
    setFieldError,
  };
}
