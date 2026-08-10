import React from 'react';

export const FormSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        className={`form-input form-select ${error ? 'form-input-error' : ''}`.trim()}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="field-error-message" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
    </div>
  );
};

export default FormSelect;
