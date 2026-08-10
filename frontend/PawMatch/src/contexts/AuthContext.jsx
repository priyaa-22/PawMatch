import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/auth.service';
import profileService from '../services/profile.service';
import rbacService from '../services/rbac.service';
import tokenStorage from '../utils/tokenStorage';
import {
  determineUserRole,
  getRoleDefaultRoute,
  getRoleDisplayName,
  getRoleBadgeClass,
  setDevRoleOverride,
  normalizeRole,
} from '../utils/roleUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(tokenStorage.getUser());
  const [userRoles, setUserRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [devRoleState, setDevRoleState] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user && tokenStorage.getAccessToken());

  const fetchUserRolesAndPermissions = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const [rolesRes, permsRes] = await Promise.allSettled([
        rbacService.getUserRoles(userId),
        rbacService.getUserPermissions(userId),
      ]);

      if (rolesRes.status === 'fulfilled' && rolesRes.value.success) {
        setUserRoles(rolesRes.value.data?.roles || []);
      }
      if (permsRes.status === 'fulfilled' && permsRes.value.success) {
        setUserPermissions(permsRes.value.data?.permissions || []);
      }
    } catch (e) {
      console.warn('Failed to fetch user roles/permissions:', e);
    }
  }, []);

  const loadUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setUserRoles([]);
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        tokenStorage.setUser(res.data);
        if (res.data.id) {
          await fetchUserRolesAndPermissions(res.data.id);
        }
      } else {
        tokenStorage.clear();
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load authenticated user:', err);
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserRolesAndPermissions]);

  useEffect(() => {
    loadUser();

    const handleAuthLogout = () => {
      setUser(null);
      setUserRoles([]);
      setUserPermissions([]);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [loadUser]);

  // Centralized current role resolution (Single Source of Truth)
  const currentRole = useMemo(() => {
    if (!isAuthenticated) return null;
    return determineUserRole(user, userRoles);
  }, [isAuthenticated, user, userRoles, devRoleState]);

  const roleDisplayName = useMemo(() => {
    return getRoleDisplayName(currentRole);
  }, [currentRole]);

  const roleBadgeClass = useMemo(() => {
    return getRoleBadgeClass(currentRole);
  }, [currentRole]);

  const defaultRoute = useMemo(() => {
    return getRoleDefaultRoute(currentRole);
  }, [currentRole]);

  const setDevRole = (role) => {
    setDevRoleOverride(role);
    setDevRoleState(role);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        setUser(res.data.user);
        if (res.data.user?.id) {
          await fetchUserRolesAndPermissions(res.data.user.id);
        }
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    return authService.register(data);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setUserRoles([]);
      setUserPermissions([]);
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const res = await authService.refreshToken();
      return res;
    } catch (e) {
      logout();
      throw e;
    }
  };

  const updateProfile = async (data) => {
    const res = await profileService.updateProfile(data);
    if (res.success && res.data) {
      await loadUser();
    }
    return res;
  };

  /**
   * Reusable role checker helper
   */
  const hasRole = (roleInput) => {
    if (!roleInput) return true;
    if (!currentRole) return false;

    const allowed = Array.isArray(roleInput) ? roleInput : [roleInput];
    const normalizedAllowed = allowed.map((r) => normalizeRole(r)).filter(Boolean);

    // Match resolved current role
    if (normalizedAllowed.includes(currentRole)) return true;

    // Match raw backend roles
    return userRoles.some((r) => {
      const n = normalizeRole(r);
      return n && normalizedAllowed.includes(n);
    });
  };

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (Array.isArray(permission)) {
      return permission.some((p) => userPermissions.includes(p));
    }
    return userPermissions.includes(permission);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    userRoles,
    userPermissions,
    currentRole,
    roleDisplayName,
    roleBadgeClass,
    defaultRoute,
    setDevRole,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    loadUser,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
