import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getNavigationForRole, PUBLIC_NAV_ITEMS } from '../../config/navigationConfig';
import './Navbar.css';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAuthenticated, user, currentRole, roleDisplayName, roleBadgeClass, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = isAuthenticated
    ? getNavigationForRole(currentRole)
    : PUBLIC_NAV_ITEMS;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavLink = (link, isMobile = false) => {
    const isAnchor = link.href.startsWith('/#');
    const className = isMobile ? 'mobile-nav-link' : 'nav-link';
    const onClick = isMobile ? closeMobileMenu : undefined;

    if (isAnchor) {
      return (
        <a href={link.href} className={className} onClick={onClick}>
          {link.name}
        </a>
      );
    }
    return (
      <Link to={link.href} className={className} onClick={onClick}>
        {link.name}
      </Link>
    );
  };

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/">
          <Logo size="medium" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.name} className="nav-item">
                {renderNavLink(link, false)}
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Buttons Desktop */}
        <div className="nav-auth-actions">
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.65rem' }}>
                  {roleDisplayName}
                </span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard ({user?.first_name || 'Account'})
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                Profile
              </Button>
              <Button variant="primary" size="sm" onClick={logout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="login-btn" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="primary" size="sm" className="signup-btn" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={`mobile-hamburger ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Menu Drawer */}
        <div className={`mobile-drawer ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="drawer-overlay" onClick={closeMobileMenu}></div>
          <div className="drawer-content">
            <div className="drawer-header">
              <Logo size="small" />
              <button
                type="button"
                className="drawer-close-btn"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                &times;
              </button>
            </div>
            {isAuthenticated && (
              <div style={{ padding: '0 1rem 0.5rem 1rem' }}>
                <span className={`badge ${roleBadgeClass}`}>
                  {roleDisplayName}
                </span>
              </div>
            )}
            <nav className="mobile-nav">
              <ul className="mobile-nav-list">
                {navLinks.map((link) => (
                  <li key={link.name} className="mobile-nav-item">
                    {renderNavLink(link, true)}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mobile-auth-actions">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" fullWidth size="md" onClick={() => { closeMobileMenu(); navigate('/dashboard'); }}>
                    Dashboard
                  </Button>
                  <Button variant="primary" fullWidth size="md" onClick={() => { closeMobileMenu(); logout(); }}>
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" fullWidth size="md" onClick={() => { closeMobileMenu(); navigate('/login'); }}>
                    Login
                  </Button>
                  <Button variant="primary" fullWidth size="md" onClick={() => { closeMobileMenu(); navigate('/register'); }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
