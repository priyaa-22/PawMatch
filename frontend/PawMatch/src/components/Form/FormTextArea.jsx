import React from 'react';

export const FormTextArea = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  rows = 3,
  error,
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        className={`form-input ${error ? 'form-input-error' : ''}`.trim()}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        style={{ resize: 'vertical', minHeight: '80px' }}
      />
      {error && (
        <span className="field-error-message" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
    </div>
  );
};

export default FormTextArea;
