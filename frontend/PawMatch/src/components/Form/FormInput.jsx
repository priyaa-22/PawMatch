import React from 'react';

export const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  autoComplete,
  error,
  helperText,
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        className={`form-input ${error ? 'form-input-error' : ''}`.trim()}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      {helperText && !error && (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
          {helperText}
        </span>
      )}
      {error && (
        <span className="field-error-message" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
