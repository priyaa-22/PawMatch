import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ACCOUNT_TYPES,
  ROLE_FIELDS,
  INITIAL_FORM_STATE,
  buildRegisterPayload,
} from '../config/roleRegistrationConfig';
import FormSelect from '../components/Form/FormSelect';
import DynamicRoleForm from '../components/DynamicRoleForm/DynamicRoleForm';
import './RegisterPage.css';

export const RegisterPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const activeRole = formData.account_type || 'pet_owner';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData((prev) => ({ ...prev, account_type: selectedRole }));
    // Clear previous field-level validation errors on role change
    setFieldErrors({});
    setErrorMsg('');
  };

  const validateForm = () => {
    const activeFields = ROLE_FIELDS[activeRole] || [];
    const errors = {};
    let isValid = true;

    // Validate only currently visible active fields
    activeFields.forEach((field) => {
      if (field.required) {
        const val = formData[field.name];
        if (!val || (typeof val === 'string' && val.trim() === '')) {
          errors[field.name] = [`${field.label} is required.`];
          isValid = false;
        }
      }
    });

    if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password) {
      errors.confirm_password = ['Passwords do not match.'];
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      if (errors.confirm_password && Object.keys(errors).length === 1) {
        setErrorMsg('Passwords do not match.');
      } else {
        setErrorMsg('Please fill in all required fields accurately.');
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      /**
       * CRITICAL: Build API payload.
       * Sends strictly ONLY { first_name, last_name, email, password, confirm_password }
       * Extra role fields remain strictly on the frontend UI.
       */
      const payload = buildRegisterPayload(formData, activeRole);
      
      const res = await register(payload);
      if (res.success) {
        setSuccessMsg(res.message || 'Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card auth-card-wide">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Join PawMatch to start your pet adoption journey
          </p>
        </div>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* 1. ACCOUNT TYPE DROPDOWN */}
          <div className="role-selector-wrapper">
            <FormSelect
              id="register-account-type"
              name="account_type"
              label="Account Type"
              value={activeRole}
              onChange={handleRoleChange}
              options={ACCOUNT_TYPES}
              required
              disabled={submitting}
            />
          </div>

          {/* 2. DYNAMIC FORM FIELDS */}
          <DynamicRoleForm
            roleId={activeRole}
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleChange}
            disabled={submitting}
          />

          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1.5rem' }}>
            {submitting ? <span className="loading-spinner"></span> : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent-brown)', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
