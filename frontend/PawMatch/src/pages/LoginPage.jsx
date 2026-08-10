import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput/PasswordInput';
import { getRoleDefaultRoute, determineUserRole } from '../utils/roleUtils';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg(res.message || 'Login successful!');

        // Determine post-login redirect path based on user role
        const loggedUser = res.data?.user;
        const resolvedRole = determineUserRole(loggedUser, []);
        const roleRoute = getRoleDefaultRoute(resolvedRole);
        const targetRoute = location.state?.from?.pathname || roleRoute;

        setTimeout(() => {
          navigate(targetRoute, { replace: true });
        }, 500);
      } else {
        setErrorMsg(res.message || 'Failed to login. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 className="heading-md" style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Sign in to access your PawMatch account
          </p>
        </div>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              disabled={submitting}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-accent-brown)' }}>
                Forgot Password?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={submitting}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '1rem' }}>
            {submitting ? <span className="loading-spinner"></span> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent-brown)', fontWeight: '600' }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
