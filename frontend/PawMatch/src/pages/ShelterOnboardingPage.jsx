import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useShelter from '../hooks/useShelter';
import FormInput from '../components/Form/FormInput';
import FormTextArea from '../components/Form/FormTextArea';
import './ShelterOnboardingPage.css';

const INITIAL_FORM_STATE = {
  name: '',
  legal_name: '',
  registration_number: '',
  tax_id: '',
  email: '',
  phone_number: '',
  website: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'United States',
  latitude: '',
  longitude: '',
  description: '',
};

export const ShelterOnboardingPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdShelter, setCreatedShelter] = useState(null);

  const { registerShelter } = useShelter();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name || !formData.name.trim()) {
      errors.name = ['Shelter name is required.'];
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = ['Shelter name must be at least 2 characters.'];
      isValid = false;
    }

    if (!formData.email || !formData.email.trim()) {
      errors.email = ['Organization email is required.'];
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = ['Please enter a valid email address.'];
      isValid = false;
    }

    if (!formData.phone_number || !formData.phone_number.trim()) {
      errors.phone_number = ['Phone number is required.'];
      isValid = false;
    }

    if (!formData.address_line1 || !formData.address_line1.trim()) {
      errors.address_line1 = ['Address line 1 is required.'];
      isValid = false;
    }

    if (!formData.city || !formData.city.trim()) {
      errors.city = ['City is required.'];
      isValid = false;
    }

    if (!formData.state || !formData.state.trim()) {
      errors.state = ['State is required.'];
      isValid = false;
    }

    if (!formData.postal_code || !formData.postal_code.trim()) {
      errors.postal_code = ['Postal code is required.'];
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      setErrorMsg('Please fill in all required fields accurately before submitting.');
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        address_line1: formData.address_line1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
      };

      if (formData.legal_name?.trim()) payload.legal_name = formData.legal_name.trim();
      if (formData.registration_number?.trim()) payload.registration_number = formData.registration_number.trim();
      if (formData.tax_id?.trim()) payload.tax_id = formData.tax_id.trim();
      if (formData.website?.trim()) payload.website = formData.website.trim();
      if (formData.address_line2?.trim()) payload.address_line2 = formData.address_line2.trim();
      if (formData.country?.trim()) payload.country = formData.country.trim();
      if (formData.description?.trim()) payload.description = formData.description.trim();

      if (formData.latitude) {
        const lat = parseFloat(formData.latitude);
        if (!isNaN(lat)) payload.latitude = lat;
      }

      if (formData.longitude) {
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lng)) payload.longitude = lng;
      }

      const res = await registerShelter(payload);

      if (res && res.success) {
        setCreatedShelter(res.data);
      } else {
        setErrorMsg(res?.message || 'Shelter registration failed.');
        if (res?.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during shelter registration.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render Success Card State after successful registration
  if (createdShelter) {
    const isVerified = Boolean(createdShelter.is_verified);
    const canPublishPets = Boolean(createdShelter.can_publish_pets);
    const status = createdShelter.status || 'unverified';

    return (
      <div className="shelter-onboarding-container">
        <div className="success-state-card">
          <div className="success-icon-badge">🏠</div>
          <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>
            Shelter Registered Successfully!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Your shelter organization profile <strong>{createdShelter.name}</strong> has been created.
          </p>

          {/* Shelter Status Summary Box */}
          <div className="shelter-status-summary">
            <div className="summary-row">
              <span className="summary-label">Shelter Name</span>
              <span className="summary-value">{createdShelter.name}</span>
            </div>

            {createdShelter.legal_name && (
              <div className="summary-row">
                <span className="summary-label">Legal Name</span>
                <span className="summary-value">{createdShelter.legal_name}</span>
              </div>
            )}

            <div className="summary-row">
              <span className="summary-label">Operational Status</span>
              <span className="status-pill status-pill-unverified">
                ⚠️ {status}
              </span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Verification Status</span>
              <span className={`status-pill ${isVerified ? '' : 'status-pill-unverified'}`}>
                {isVerified ? '✅ Verified' : '⏳ Pending Review (is_verified: false)'}
              </span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Pet Publishing Permission</span>
              <span className={`status-pill ${canPublishPets ? '' : 'status-pill-disabled'}`}>
                {canPublishPets ? '✅ Enabled' : '🔒 Disabled (can_publish_pets: false)'}
              </span>
            </div>
          </div>

          <div
            className="alert alert-info"
            style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.875rem' }}
          >
            <strong>Note on Verification:</strong> New shelter registrations begin in an <em>unverified</em> status.
            You are assigned as the shelter <strong>OWNER</strong>.
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/dashboard/shelter')}
              style={{ width: 'auto' }}
            >
              Go to Shelter Dashboard
            </button>
            <Link to="/profile" className="btn-secondary">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shelter-onboarding-container">
      <div className="shelter-onboarding-card">
        <div className="onboarding-header">
          <h1 className="heading-md">Shelter Organization Onboarding</h1>
          <p>Register your animal shelter organization to start managing adoptions on PawMatch</p>
        </div>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* SECTION 1 — Organization */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">1</div>
              <h2 className="form-section-title">Organization Information</h2>
            </div>

            <div className="form-grid-2">
              <FormInput
                id="shelter-name"
                name="name"
                label="Shelter / Organization Name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Happy Paws Animal Rescue"
                required
                disabled={submitting}
                error={fieldErrors.name}
              />

              <FormInput
                id="shelter-legal-name"
                name="legal_name"
                label="Legal Name"
                value={formData.legal_name}
                onChange={handleChange}
                placeholder="Official registered legal entity name"
                disabled={submitting}
                error={fieldErrors.legal_name}
              />

              <FormInput
                id="shelter-reg-number"
                name="registration_number"
                label="Registration Number"
                value={formData.registration_number}
                onChange={handleChange}
                placeholder="Government or NGO registration ID"
                disabled={submitting}
                error={fieldErrors.registration_number}
              />

              <FormInput
                id="shelter-tax-id"
                name="tax_id"
                label="Tax ID / EIN"
                value={formData.tax_id}
                onChange={handleChange}
                placeholder="Tax identification or 501(c)(3) number"
                disabled={submitting}
                error={fieldErrors.tax_id}
              />
            </div>
          </div>

          {/* SECTION 2 — Contact */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">2</div>
              <h2 className="form-section-title">Contact Details</h2>
            </div>

            <div className="form-grid-3">
              <FormInput
                id="shelter-email"
                name="email"
                label="Organization Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@shelter.org"
                required
                disabled={submitting}
                error={fieldErrors.email}
              />

              <FormInput
                id="shelter-phone"
                name="phone_number"
                label="Phone Number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
                disabled={submitting}
                error={fieldErrors.phone_number}
              />

              <FormInput
                id="shelter-website"
                name="website"
                label="Website URL"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.shelter.org"
                disabled={submitting}
                error={fieldErrors.website}
              />
            </div>
          </div>

          {/* SECTION 3 — Address */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">3</div>
              <h2 className="form-section-title">Shelter Location &amp; Address</h2>
            </div>

            <div className="form-grid-2">
              <FormInput
                id="shelter-addr1"
                name="address_line1"
                label="Address Line 1"
                value={formData.address_line1}
                onChange={handleChange}
                placeholder="Street address or P.O. Box"
                required
                disabled={submitting}
                error={fieldErrors.address_line1}
              />

              <FormInput
                id="shelter-addr2"
                name="address_line2"
                label="Address Line 2"
                value={formData.address_line2}
                onChange={handleChange}
                placeholder="Suite, building, unit, etc."
                disabled={submitting}
                error={fieldErrors.address_line2}
              />
            </div>

            <div className="form-grid-3">
              <FormInput
                id="shelter-city"
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
                disabled={submitting}
                error={fieldErrors.city}
              />

              <FormInput
                id="shelter-state"
                name="state"
                label="State / Province"
                value={formData.state}
                onChange={handleChange}
                placeholder="State or Province"
                required
                disabled={submitting}
                error={fieldErrors.state}
              />

              <FormInput
                id="shelter-postal"
                name="postal_code"
                label="Postal Code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="Zip or postal code"
                required
                disabled={submitting}
                error={fieldErrors.postal_code}
              />
            </div>

            <div className="form-grid-3" style={{ marginTop: '0.25rem' }}>
              <FormInput
                id="shelter-country"
                name="country"
                label="Country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                disabled={submitting}
                error={fieldErrors.country}
              />

              <FormInput
                id="shelter-lat"
                name="latitude"
                label="Latitude (Optional)"
                type="number"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 37.7749"
                disabled={submitting}
                error={fieldErrors.latitude}
              />

              <FormInput
                id="shelter-lng"
                name="longitude"
                label="Longitude (Optional)"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. -122.4194"
                disabled={submitting}
                error={fieldErrors.longitude}
              />
            </div>
          </div>

          {/* SECTION 4 — About */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-number">4</div>
              <h2 className="form-section-title">About the Shelter</h2>
            </div>

            <FormTextArea
              id="shelter-description"
              name="description"
              label="Organization Description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell adopters about your shelter's mission, facilities, and adoption policies..."
              disabled={submitting}
              rows={4}
              error={fieldErrors.description}
            />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ padding: '0.95rem 2rem', fontSize: '1rem' }}
            >
              {submitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Registering Shelter...
                </>
              ) : (
                'Submit Shelter Onboarding'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShelterOnboardingPage;
