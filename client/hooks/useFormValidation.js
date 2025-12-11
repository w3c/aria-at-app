import { useState, useCallback, useMemo } from 'react';

/**
 * @typedef {Object} UseFormValidationOptions
 * @property {Object} [initialData={}] - Initial form data object
 * @property {Object<string, Function>} [validators={}] - Object mapping field names
 *   to validator functions. Validators should throw errors when validation fails
 * @property {Function|null} [checkDuplicates=null] - Optional function to check for
 *   duplicate values. Should return a truthy value if duplicates are found
 */

/**
 * @typedef {Object} UseFormValidationReturn
 * @property {Object} formData - Current form data values
 * @property {Object<string, string>} errors - Object mapping field names to error messages
 * @property {*} duplicateCheck - Result of duplicate check function, or null
 * @property {Function} updateField - Function to update a field value (fieldName, value)
 * @property {Function} validateForm - Function to validate all fields, returns boolean
 * @property {Function} resetForm - Function to reset form to initial data
 * @property {boolean} isValid - True if form has no errors and no duplicates
 */

/**
 * Generic hook for form validation. Manages form data state, validates fields
 * using provided validators, and checks for duplicates. Validators should throw
 * errors with messages when validation fails.
 *
 * @param {UseFormValidationOptions} options - Configuration options
 * @returns {UseFormValidationReturn}
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
