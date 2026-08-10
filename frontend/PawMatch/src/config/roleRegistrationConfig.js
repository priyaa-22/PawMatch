/**
 * Configuration for Role-Based Registration in PawMatch
 * 
 * Defines available roles, form fields per role, and API payload transformation.
 */

export const ACCOUNT_TYPES = [
  { id: 'pet_owner', label: 'Pet Owner' },
  { id: 'shelter_admin', label: 'Shelter Administrator' },
  { id: 'ngo_admin', label: 'NGO Administrator' },
  { id: 'rescue_org', label: 'Rescue Organization' },
  { id: 'veterinarian', label: 'Veterinarian' },
  { id: 'volunteer', label: 'Volunteer' },
];

/**
 * Field metadata definitions per role
 */
export const ROLE_FIELDS = {
  pet_owner: [
    {
      id: 'first_name',
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      placeholder: 'John',
      required: true,
      gridSpan: 1,
      autoComplete: 'given-name',
    },
    {
      id: 'last_name',
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Doe',
      required: true,
      gridSpan: 1,
      autoComplete: 'family-name',
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'user@example.com',
      required: true,
      gridSpan: 2,
      autoComplete: 'email',
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: 'Confirm Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
  ],

  shelter_admin: [
    {
      id: 'shelter_name',
      name: 'shelter_name',
      label: 'Shelter Name',
      type: 'text',
      placeholder: 'Happy Paws Shelter',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'registration_number',
      name: 'registration_number',
      label: 'Registration Number',
      type: 'text',
      placeholder: 'REG-123456',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'contact_person',
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text',
      placeholder: 'Jane Smith',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'shelter@example.com',
      required: true,
      gridSpan: 1,
      autoComplete: 'email',
    },
    {
      id: 'phone_number',
      name: 'phone_number',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 000-0000',
      required: true,
      gridSpan: 1,
      autoComplete: 'tel',
    },
    {
      id: 'address',
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: '123 Rescue Way',
      required: true,
      gridSpan: 2,
      autoComplete: 'street-address',
    },
    {
      id: 'city',
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Springfield',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'state',
      name: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'Illinois',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'pincode',
      name: 'pincode',
      label: 'Pincode',
      type: 'text',
      placeholder: '62701',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'website',
      name: 'website',
      label: 'Website (optional)',
      type: 'url',
      placeholder: 'https://happypaws.org',
      required: false,
      gridSpan: 1,
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: 'Confirm Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
  ],

  ngo_admin: [
    {
      id: 'ngo_name',
      name: 'ngo_name',
      label: 'NGO Name',
      type: 'text',
      placeholder: 'Animal Welfare Foundation',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'ngo_registration_number',
      name: 'ngo_registration_number',
      label: 'NGO Registration Number',
      type: 'text',
      placeholder: 'NGO-987654',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'contact_person',
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text',
      placeholder: 'Robert Johnson',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'ngo@example.org',
      required: true,
      gridSpan: 1,
      autoComplete: 'email',
    },
    {
      id: 'phone_number',
      name: 'phone_number',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 111-2222',
      required: true,
      gridSpan: 1,
      autoComplete: 'tel',
    },
    {
      id: 'address',
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: '456 Compassion Blvd',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'city',
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Metropolis',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'state',
      name: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'New York',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'website',
      name: 'website',
      label: 'Website',
      type: 'url',
      placeholder: 'https://animalwelfare.org',
      required: false,
      gridSpan: 2,
    },
    {
      id: 'description',
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Briefly describe your NGO mission and activity...',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: 'Confirm Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
  ],

  rescue_org: [
    {
      id: 'organization_name',
      name: 'organization_name',
      label: 'Organization Name',
      type: 'text',
      placeholder: 'Paws Rescue Alliance',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'contact_person',
      name: 'contact_person',
      label: 'Contact Person',
      type: 'text',
      placeholder: 'Sarah Parker',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'rescue@example.org',
      required: true,
      gridSpan: 1,
      autoComplete: 'email',
    },
    {
      id: 'phone_number',
      name: 'phone_number',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 333-4444',
      required: true,
      gridSpan: 1,
      autoComplete: 'tel',
    },
    {
      id: 'operating_area',
      name: 'operating_area',
      label: 'Operating Area',
      type: 'text',
      placeholder: 'Greater Metropolitan Region',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'address',
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: '789 Haven Street',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'city',
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Austin',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'state',
      name: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'Texas',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'website',
      name: 'website',
      label: 'Website',
      type: 'url',
      placeholder: 'https://pawsrescue.org',
      required: false,
      gridSpan: 2,
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: 'Confirm Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
  ],

  veterinarian: [
    {
      id: 'doctor_name',
      name: 'doctor_name',
      label: 'Doctor Name',
      type: 'text',
      placeholder: 'Dr. Alex Vance',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'clinic_name',
      name: 'clinic_name',
      label: 'Clinic Name',
      type: 'text',
      placeholder: 'City Pet Hospital',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'medical_registration_number',
      name: 'medical_registration_number',
      label: 'Medical Registration Number',
      type: 'text',
      placeholder: 'VET-789012',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'dr.vance@pethospital.com',
      required: true,
      gridSpan: 1,
      autoComplete: 'email',
    },
    {
      id: 'phone_number',
      name: 'phone_number',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 777-8888',
      required: true,
      gridSpan: 1,
      autoComplete: 'tel',
    },
    {
      id: 'clinic_address',
      name: 'clinic_address',
      label: 'Clinic Address',
      type: 'text',
      placeholder: '101 Care Lane',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'city',
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Seattle',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'state',
      name: 'state',
      label: 'State',
      type: 'text',
      placeholder: 'Washington',
      required: true,
      gridSpan: 1,
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: 'Confirm Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
  ],

  volunteer: [
    {
      id: 'first_name',
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      placeholder: 'Emily',
      required: true,
      gridSpan: 1,
      autoComplete: 'given-name',
    },
    {
      id: 'last_name',
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Clark',
      required: true,
      gridSpan: 1,
      autoComplete: 'family-name',
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'emily@example.com',
      required: true,
      gridSpan: 1,
      autoComplete: 'email',
    },
    {
      id: 'phone_number',
      name: 'phone_number',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+1 (555) 999-0000',
      required: true,
      gridSpan: 1,
      autoComplete: 'tel',
    },
    {
      id: 'city',
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Portland',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'areas_of_interest',
      name: 'areas_of_interest',
      label: 'Areas of Interest',
      type: 'textarea',
      placeholder: 'e.g., Fostering, Event Organization, Transport, Dog Walking...',
      required: true,
      gridSpan: 2,
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
    {
      id: 'confirm_password',
      name: 'confirm_password',
      label: 'Confirm Password',
      type: 'password',
      placeholder: '••••••••',
      required: true,
      gridSpan: 2,
      autoComplete: 'new-password',
    },
  ],
};

/**
 * Initial empty state for all form fields across all roles
 */
export const INITIAL_FORM_STATE = {
  account_type: 'pet_owner',
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  shelter_name: '',
  ngo_name: '',
  organization_name: '',
  doctor_name: '',
  clinic_name: '',
  contact_person: '',
  registration_number: '',
  ngo_registration_number: '',
  medical_registration_number: '',
  address: '',
  clinic_address: '',
  city: '',
  state: '',
  pincode: '',
  operating_area: '',
  website: '',
  description: '',
  areas_of_interest: '',
  password: '',
  confirm_password: '',
};

/**
 * Constructs the registration API payload.
 *
 * ============================================================================
 * CURRENT API BEHAVIOR:
 * Sends ONLY the standard 5 fields:
 * {
 *   first_name,
 *   last_name,
 *   email,
 *   password,
 *   confirm_password
 * }
 * Extra role-specific fields collected in the UI are ignored for now.
 *
 * ============================================================================
 * FUTURE BACKEND INTEGRATION INSTRUCTIONS:
 * When the Django backend API supports role-based registration, update ONLY
 * this function to include the account_type and role-specific fields.
 * Example Future Code:
 * return {
 *   account_type: roleId,
 *   ...formData
 * };
 * ============================================================================
 *
 * @param {Object} formData Current form values
 * @param {string} roleId Active account type role ID
 * @returns {Object} Payload sent to backend registration endpoint
 */
export function buildRegisterPayload(formData, _roleId) {
  let firstName = (formData.first_name || '').trim();
  let lastName = (formData.last_name || '').trim();

  // If first_name / last_name are not explicit input fields for this role,
  // derive them from Contact Person, Doctor Name, or Organization Name.
  if (!firstName) {
    let nameSource = '';
    if (formData.contact_person) {
      nameSource = formData.contact_person.trim();
    } else if (formData.doctor_name) {
      nameSource = formData.doctor_name.trim();
    } else if (formData.shelter_name) {
      nameSource = formData.shelter_name.trim();
    } else if (formData.ngo_name) {
      nameSource = formData.ngo_name.trim();
    } else if (formData.organization_name) {
      nameSource = formData.organization_name.trim();
    }

    if (nameSource) {
      const parts = nameSource.split(/\s+/);
      firstName = parts[0] || 'User';
      lastName = parts.slice(1).join(' ') || parts[0];
    } else {
      firstName = 'User';
      lastName = 'Account';
    }
  }

  return {
    first_name: firstName,
    last_name: lastName || firstName,
    email: (formData.email || '').trim(),
    password: formData.password || '',
    confirm_password: formData.confirm_password || '',
  };
}
