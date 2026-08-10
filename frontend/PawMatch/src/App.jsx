import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RoleGuard from './components/RoleGuard/RoleGuard';
import { ROLES } from './config/rolesConfig';

import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import SearchPanel from './components/SearchPanel/SearchPanel';
import FeaturedPets from './components/FeaturedPets/FeaturedPets';
import HowItWorks from './components/HowItWorks/HowItWorks';
import Features from './components/Features/Features';
import Statistics from './components/Statistics/Statistics';
import ShelterBanner from './components/ShelterBanner/ShelterBanner';
import Testimonials from './components/Testimonials/Testimonials';
import CTA from './components/CTA/CTA';
import Footer from './components/Footer/Footer';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import RBACAdminPage from './pages/RBACAdminPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import PetOwnerDashboard from './pages/dashboards/PetOwnerDashboard';
import ShelterDashboard from './pages/dashboards/ShelterDashboard';
import NGODashboard from './pages/dashboards/NGODashboard';
import RescueDashboard from './pages/dashboards/RescueDashboard';
import VeterinarianDashboard from './pages/dashboards/VeterinarianDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ModeratorDashboard from './pages/dashboards/ModeratorDashboard';

import './App.css';

function LandingPage() {
  return (
    <main className="main-content">
      <Hero />
      <SearchPanel />
      <FeaturedPets />
      <HowItWorks />
      <Features />
      <Statistics />
      <ShelterBanner />
      <Testimonials />
      <CTA />
    </main>
  );
}

const GenericRoleModulePage = ({ title, icon, subtitle }) => (
  <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
    <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h1 className="heading-md" style={{ marginBottom: '0.5rem' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{subtitle}</p>
      <Link to="/dashboard" className="btn-secondary">Return to Dashboard</Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/resend-verification" element={<ResendVerificationPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Authenticated Common Profile & Dynamic Dashboard */}
            <Route
              path="/dashboard"
              element={
                <RoleGuard>
                  <DashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <RoleGuard>
                  <ProfilePage />
                </RoleGuard>
              }
            />

            {/* Role-Specific Protected Dashboard Routes */}
            <Route
              path="/dashboard/pet-owner"
              element={
                <RoleGuard allowedRoles={[ROLES.PET_OWNER, ROLES.SUPER_ADMIN]}>
                  <PetOwnerDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/shelter"
              element={
                <RoleGuard allowedRoles={[ROLES.SHELTER_ADMIN, ROLES.SUPER_ADMIN]}>
                  <ShelterDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/ngo"
              element={
                <RoleGuard allowedRoles={[ROLES.NGO_ADMIN, ROLES.SUPER_ADMIN]}>
                  <NGODashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/rescue"
              element={
                <RoleGuard allowedRoles={[ROLES.RESCUE_ORG, ROLES.SUPER_ADMIN]}>
                  <RescueDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/veterinarian"
              element={
                <RoleGuard allowedRoles={[ROLES.VETERINARIAN, ROLES.SUPER_ADMIN]}>
                  <VeterinarianDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/dashboard/moderator"
              element={
                <RoleGuard allowedRoles={[ROLES.MODERATOR, ROLES.SUPER_ADMIN]}>
                  <ModeratorDashboard />
                </RoleGuard>
              }
            />

            {/* Protected Role Feature Sub-routes */}
            <Route
              path="/favorites"
              element={
                <RoleGuard allowedRoles={[ROLES.PET_OWNER, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Saved Favorites" icon="❤️" subtitle="View and manage your bookmarked pet profiles." />
                </RoleGuard>
              }
            />
            <Route
              path="/applications"
              element={
                <RoleGuard allowedRoles={[ROLES.PET_OWNER, ROLES.SHELTER_ADMIN, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Adoption Applications" icon="📑" subtitle="Track and manage adoption application questionnaires." />
                </RoleGuard>
              }
            />
            <Route
              path="/pet-listings"
              element={
                <RoleGuard allowedRoles={[ROLES.SHELTER_ADMIN, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Shelter Pet Listings" icon="🐾" subtitle="Manage shelter animal profiles and availability status." />
                </RoleGuard>
              }
            />
            <Route
              path="/analytics"
              element={
                <RoleGuard allowedRoles={[ROLES.SHELTER_ADMIN, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Shelter Analytics" icon="📊" subtitle="Adoption velocity and shelter occupancy metrics." />
                </RoleGuard>
              }
            />
            <Route
              path="/campaigns"
              element={
                <RoleGuard allowedRoles={[ROLES.NGO_ADMIN, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="NGO Welfare Campaigns" icon="📢" subtitle="Manage community fundraising drives and vaccination events." />
                </RoleGuard>
              }
            />
            <Route
              path="/sponsorships"
              element={
                <RoleGuard allowedRoles={[ROLES.NGO_ADMIN, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Animal Sponsorships" icon="🎁" subtitle="Manage recurring donor sponsorships for long-term shelter residents." />
                </RoleGuard>
              }
            />
            <Route
              path="/reports"
              element={
                <RoleGuard allowedRoles={[ROLES.NGO_ADMIN, ROLES.RESCUE_ORG, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Welfare & Operations Reports" icon="📈" subtitle="Impact reports and rescue metric statistics." />
                </RoleGuard>
              }
            />
            <Route
              path="/rescue-requests"
              element={
                <RoleGuard allowedRoles={[ROLES.RESCUE_ORG, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Emergency Rescue Requests" icon="🆘" subtitle="Dispatches and emergency distress call intake." />
                </RoleGuard>
              }
            />
            <Route
              path="/animals"
              element={
                <RoleGuard allowedRoles={[ROLES.RESCUE_ORG, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Rescued Animals Triage" icon="🐕" subtitle="Manage quarantine, triage, and foster placements." />
                </RoleGuard>
              }
            />
            <Route
              path="/appointments"
              element={
                <RoleGuard allowedRoles={[ROLES.VETERINARIAN, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Veterinary Appointments" icon="📅" subtitle="Clinic calendar and health clearance appointments." />
                </RoleGuard>
              }
            />
            <Route
              path="/patients"
              element={
                <RoleGuard allowedRoles={[ROLES.VETERINARIAN, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Patient Health Records" icon="📋" subtitle="Medical records, vaccine history, and microchip logs." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="User Account Directory" icon="👥" subtitle="Manage user credentials, suspensions, and account details." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/verification"
              element={
                <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Organization Verification Queue" icon="✅" subtitle="Review shelter and NGO license applications." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="System Audit Logs" icon="📜" subtitle="Security event logs and audit trail telemetry." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Platform Configuration" icon="⚙️" subtitle="Global platform configuration and parameters." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/rbac"
              element={
                <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]}>
                  <RBACAdminPage />
                </RoleGuard>
              }
            />
            <Route
              path="/moderation/queue"
              element={
                <RoleGuard allowedRoles={[ROLES.MODERATOR, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Moderation Queue" icon="⚠️" subtitle="Review flagged content and policy violations." />
                </RoleGuard>
              }
            />
            <Route
              path="/moderation/reports"
              element={
                <RoleGuard allowedRoles={[ROLES.MODERATOR, ROLES.SUPER_ADMIN]}>
                  <GenericRoleModulePage title="Community Safety Reports" icon="📢" subtitle="Inspect user safety complaints and scam reports." />
                </RoleGuard>
              }
            />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
