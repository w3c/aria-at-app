import React from 'react';
import PropTypes from 'prop-types';

/**
 * Generic form field component with validation support
 */
const FormField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  helpText,
  placeholder,
  className = 'form-control',
  ...props
}) => {
  const fieldId = id || name;
  const hasError = !!error;
  const inputClassName = `${className}${hasError ? ' is-invalid' : ''}`;

  return (
    <div className="mb-2">
      <label className="form-label" htmlFor={fieldId}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        className={inputClassName}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        aria-invalid={hasError}
        {...props}
      />
      {helpText && <div className="form-text">{helpText}</div>}
      {hasError && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

FormField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

export default FormField;
