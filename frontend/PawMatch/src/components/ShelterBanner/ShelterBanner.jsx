import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button/Button';
import './ShelterBanner.css';

export const ShelterBanner = () => {
  const navigate = useNavigate();

  const handleRegisterShelter = () => {
    navigate('/shelter/onboarding');
  };

  return (
    <section id="shelters" className="shelter-banner-section">
      <div className="container">
        <div className="shelter-banner-card">
          <div className="banner-content">
            <div className="banner-badge">Shelter &amp; Rescue Partner Network</div>
            <h2 className="banner-title">Are you an animal shelter or rescue organization?</h2>
            <p className="banner-description">
              Join PawMatch to expand your reach, manage digital adoption applications seamlessly, and connect your animals with loving families faster.
            </p>
            <div className="banner-actions">
              <Button variant="primary" size="lg" className="banner-btn" onClick={handleRegisterShelter}>
                Register Your Shelter
                <svg className="btn-arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button variant="outline" size="lg" className="banner-secondary-btn" onClick={handleRegisterShelter}>
                Learn Partner Benefits
              </Button>
            </div>
          </div>

          <div className="banner-visual-decor">
            <div className="decor-circle circle-1"></div>
            <div className="decor-circle circle-2"></div>
            <div className="shelter-badge-graphic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9" />
              </svg>
              <span>100% Free Partner Portal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShelterBanner;
