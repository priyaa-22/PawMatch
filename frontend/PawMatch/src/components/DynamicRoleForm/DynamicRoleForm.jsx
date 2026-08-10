import React from 'react';
import { ROLE_FIELDS } from '../../config/roleRegistrationConfig';
import FormInput from '../Form/FormInput';
import FormTextArea from '../Form/FormTextArea';
import PasswordInput from '../PasswordInput/PasswordInput';
import './DynamicRoleForm.css';

export const DynamicRoleForm = ({
  roleId,
  formData,
  fieldErrors = {},
  onChange,
  disabled = false,
}) => {
  const fields = ROLE_FIELDS[roleId] || ROLE_FIELDS['pet_owner'];

  return (
    <div className="dynamic-role-form-container key-fade-in" key={roleId}>
      <div className="dynamic-role-form-grid">
        {fields.map((field) => {
          const fieldError = fieldErrors[field.name];
          const isFullWidth = field.gridSpan === 2;
          const colClass = isFullWidth ? 'grid-col-full' : 'grid-col-half';

          if (field.type === 'password') {
            return (
              <div key={field.id} className={`form-group ${colClass}`}>
                <label className="form-label" htmlFor={`register-${field.id}`}>
                  {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                </label>
                <PasswordInput
                  id={`register-${field.id}`}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={disabled}
                  autoComplete={field.autoComplete || 'new-password'}
                />
                {fieldError && (
                  <span className="field-error-message" style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {Array.isArray(fieldError) ? fieldError[0] : fieldError}
                  </span>
                )}
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.id} className={colClass}>
                <FormTextArea
                  id={`register-${field.id}`}
                  name={field.name}
                  label={field.label}
                  value={formData[field.name]}
                  onChange={onChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={disabled}
                  error={fieldError}
                />
              </div>
            );
          }

          return (
            <div key={field.id} className={colClass}>
              <FormInput
                id={`register-${field.id}`}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name]}
                onChange={onChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={disabled}
                autoComplete={field.autoComplete}
                error={fieldError}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicRoleForm;
