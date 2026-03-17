import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import axiosInstance from '../../../shared/utils/axiosInstance';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
    token: 'token',
    user: 'user',
    role: 'role',
    roles: 'roles',
    permissions: 'permissions',
    companyIds: 'company_ids',
    tenantId: 'tenant_id',
};

const safeParseJson = (value) => {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const readInitialAuth = () => {
    const token = localStorage.getItem(STORAGE_KEYS.token) || null;
    const user = safeParseJson(localStorage.getItem(STORAGE_KEYS.user));
    const role = localStorage.getItem(STORAGE_KEYS.role) || '';
    const roles = safeParseJson(localStorage.getItem(STORAGE_KEYS.roles)) || [];
    const permissions = safeParseJson(localStorage.getItem(STORAGE_KEYS.permissions)) || [];
    const companyIds = safeParseJson(localStorage.getItem(STORAGE_KEYS.companyIds)) || [];
    const tenantId = localStorage.getItem(STORAGE_KEYS.tenantId) || null;
    return { token, user, role, roles, permissions, companyIds, tenantId };
};

export const AuthProvider = ({ children }) => {
    const initial = useMemo(() => readInitialAuth(), []);
    const [token, setToken] = useState(initial.token);
    const [user, setUser] = useState(initial.user);
    const [role, setRole] = useState(initial.role);
    const [roles, setRoles] = useState(initial.roles);
    const [permissions, setPermissions] = useState(initial.permissions);
    const [companyIds, setCompanyIds] = useState(initial.companyIds);
    const [tenantId, setTenantId] = useState(initial.tenantId);
    const [loading, setLoading] = useState(false);

    const isAuthenticated = useMemo(() => Boolean(token), [token]);

    const setSession = useCallback((next) => {
        const nextToken = next?.token || null;
        const nextUser = next?.user || null;
        const nextRole = next?.role || '';
        const nextRoles = next?.roles || [];
        const nextPermissions = next?.permissions || [];
        const nextCompanyIds = next?.companyIds || [];
        const nextTenantId = next?.tenantId || null;

        setToken(nextToken);
        setUser(nextUser);
        setRole(nextRole);
        setRoles(nextRoles);
        setPermissions(nextPermissions);
        setCompanyIds(nextCompanyIds);
        setTenantId(nextTenantId);

        if (nextToken) localStorage.setItem(STORAGE_KEYS.token, nextToken);
        else localStorage.removeItem(STORAGE_KEYS.token);

        if (nextUser) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
        else localStorage.removeItem(STORAGE_KEYS.user);

        if (nextRole) localStorage.setItem(STORAGE_KEYS.role, nextRole);
        else localStorage.removeItem(STORAGE_KEYS.role);

        if (nextRoles.length) localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(nextRoles));
        else localStorage.removeItem(STORAGE_KEYS.roles);

        if (nextPermissions.length) localStorage.setItem(STORAGE_KEYS.permissions, JSON.stringify(nextPermissions));
        else localStorage.removeItem(STORAGE_KEYS.permissions);

        if (nextCompanyIds.length) localStorage.setItem(STORAGE_KEYS.companyIds, JSON.stringify(nextCompanyIds));
        else localStorage.removeItem(STORAGE_KEYS.companyIds);

        if (nextTenantId) localStorage.setItem(STORAGE_KEYS.tenantId, nextTenantId);
        else localStorage.removeItem(STORAGE_KEYS.tenantId);
    }, []);

    const login = useCallback(
        async ({ email, password }) => {
            setLoading(true);
            try {
                const response = await axiosInstance.post('/users/admin-login', { email, password });
                const payload = response?.data;
                const data = payload?.data;

                if (!payload?.success || !data?.token || !data?.user) {
                    const message = payload?.error?.message || payload?.message || 'Error al iniciar sesión';
                    throw new Error(message);
                }

                setSession({
                    token: data.token,
                    user: data.user,
                    role: data?.role || '',
                    roles: data?.roles || [],
                    permissions: data?.permissions || [],
                    companyIds: data?.company_ids || [],
                    tenantId: data?.tenant_id || null,
                });

                return {
                    token: data.token,
                    user: data.user,
                    role: data?.role || '',
                    roles: data?.roles || [],
                    companyIds: data?.company_ids || [],
                };
            } finally {
                setLoading(false);
            }
        },
        [setSession]
    );

    const logout = useCallback(() => {
        setSession({ token: null, user: null, role: '', roles: [], permissions: [], companyIds: [], tenantId: null });
    }, [setSession]);

    const hasRole = useCallback((requiredRoles = []) => {
        return roles.some(r => requiredRoles.includes(r));
    }, [roles]);

    const value = useMemo(
        () => ({
            token,
            user,
            role,
            roles,
            permissions,
            companyIds,
            tenantId,
            loading,
            isAuthenticated,
            login,
            logout,
            setSession,
            hasRole,
        }),
        [token, user, role, roles, permissions, companyIds, tenantId, loading, isAuthenticated, login, logout, setSession, hasRole]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
};

export default AuthContext;
