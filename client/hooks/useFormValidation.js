import { useState, useCallback, useMemo } from 'react';

/**
 * Generic hook for form validation
 */
export const useFormValidation = ({
  initialData = {},
  validators = {},
  checkDuplicates = null
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  // Validate a single field
  const validateField = useCallback(
    (fieldName, value) => {
      const validator = validators[fieldName];
      if (!validator) return null;

      try {
        validator(value);
        return null;
      } catch (error) {
        return error.message;
      }
    },
    [validators]
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validators, validateField]);

  // Check for duplicates
  const duplicateCheck = useMemo(() => {
    if (!checkDuplicates) return null;
    return checkDuplicates(formData);
  }, [checkDuplicates, formData]);

  // Update form data
  const updateField = useCallback(
    (fieldName, value) => {
      setFormData(prev => ({ ...prev, [fieldName]: value }));

      // Clear error for this field when user starts typing
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: null }));
      }
    },
    [errors]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  return {
    formData,
    errors,
    duplicateCheck,
    updateField,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0 && !duplicateCheck
  };
};
