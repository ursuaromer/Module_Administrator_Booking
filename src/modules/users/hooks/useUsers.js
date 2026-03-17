import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useCatalogs } from '../../../shared/hooks/useCatalogs';
import { handleAxiosError } from '../../../shared/utils/errorHandler';
import toast from 'react-hot-toast';

/**
 * Hook para el manejo del estado de usuarios
 * Proporciona acceso centralizado a la lista de usuarios y funciones CRUD
 */
export const useUsers = ({ autoLoad = true } = {}) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 20,
    });
    const [stats, setStats] = useState(null);
    const searchTimeoutRef = useRef(null);
    const lastSearchTermRef = useRef('');

    // Usar el hook useCatalogs para obtener países y roles desde el backend
    const {
        catalogs,
        loadCountries,
        loadRoles,
        isLoadingCountries,
        isLoadingRoles
    } = useCatalogs();

    // Cargar países y roles al inicializar
    useEffect(() => {
        loadCountries();
        loadRoles();
    }, [loadCountries, loadRoles]);

    // Limpiar mensajes
    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    // Cargar todos los usuarios
    const loadUsers = useCallback(async ({ page = 1, limit = 10, search } = {}) => {
        setLoading(true);
        setError(null);

        try {
            const backendParams = {
                limit,
                offset: (page - 1) * limit,
                searchTerm: search,
                role: roleFilter,
                country: countryFilter
            };

            const payload = await userService.getAllUsers(backendParams);
            setUsers(payload.data);
            setPagination({
                total: payload.pagination?.total || 0,
                totalPages: payload.pagination?.totalPages || 0,
                page: page,
                limit: limit,
            });
            // Actualizar estadísticas desde el backend
            setStats(payload.stats);
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, countryFilter]);

    // Filtrar usuarios con múltiples criterios
    const filterUsers = useCallback((filters = {}) => {
        const { statusFilter } = filters;
        let filtered = [...users];

        // Filtro por estado
        if (statusFilter) {
            filtered = filtered.filter(user =>
                user.status === statusFilter
            );
        }

        return filtered;
    }, [users]);

    // Funcion para cambiar de pagina
    const handlePageChange = useCallback((nextPage) => {
        const term = searchTerm.trim();
        const shouldSearch = term.length >= 2;
        loadUsers({ page: nextPage, limit: pagination.limit, search: shouldSearch ? term : undefined });
    }, [loadUsers, pagination.limit, searchTerm]);

    const filteredUsers = useMemo(() => {
        return filterUsers({ statusFilter });
    }, [filterUsers, statusFilter]);

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
    const handleRoleFilterChange = useCallback((e) => {
        setRoleFilter(e.target.value);
        loadUsers({ page: 1, limit: pagination.limit, search: searchTerm.trim().length >= 2 ? searchTerm : undefined });
    }, [loadUsers, pagination.limit, searchTerm]);
    const handleCountryFilterChange = useCallback((e) => {
        setCountryFilter(e.target.value);
        loadUsers({ page: 1, limit: pagination.limit, search: searchTerm.trim().length >= 2 ? searchTerm : undefined });
    }, [loadUsers, pagination.limit, searchTerm]);
    const handleStatusFilterChange = useCallback((e) => setStatusFilter(e.target.value), []);

    const handleAddUser = useCallback(() => {
        toast.success('Registrar Nuevo Usuario');
    }, []);

    const handleView = useCallback((user) => {
        const userId = user.user_id;
        if (!userId) return;
        console.log('Ver usuario:', userId);
    }, []);

    const handleEdit = useCallback((user) => {
        toast.success(`Editar: ${user?.first_name || ''} ${user?.last_name || ''}`);
    }, []);

    const handleDelete = useCallback((user) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            toast.success('Funcionalidad de eliminación pendiente de implementar');
        }
    }, []);

    const getUserTypeClass = useCallback((type) => {
        switch (type) {
            case 'administrador':
            case 'Administrador':
                return 'type-admin';
            case 'cliente':
            case 'Cliente':
                return 'type-client';
            case 'super_admin':
            case 'Super Admin':
                return 'type-superadmin';
            case 'system':
            case 'System':
                return 'type-system';
            default:
                return '';
        }
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-ES');
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        if (!autoLoad) return;
        loadUsers({ page: 1, limit: pagination.limit });
    }, [autoLoad, loadUsers, pagination.limit]);

    // Efecto para búsqueda con debounce
    useEffect(() => {
        if (!autoLoad) return;

        const term = searchTerm.trim();
        const prevTerm = lastSearchTermRef.current;
        lastSearchTermRef.current = term;

        if (term === '' && prevTerm === '') return;
        if (term.length === 2) return;

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            loadUsers({ page: 1, limit: pagination.limit, search: term.length >= 2 ? term : undefined });
        }, 350);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [autoLoad, loadUsers, pagination.limit, searchTerm]);

    return {
        // Estado
        users,
        loading,
        error,
        success,
        searchTerm,
        roleFilter,
        countryFilter,
        statusFilter,
        pagination,
        stats,
        roles: catalogs.roles, // Usar roles desde el catálogo
        countries: catalogs.countries, // Usar países desde el catálogo
        isLoadingCountries,
        isLoadingRoles,

        // Acciones
        loadUsers,
        filterUsers,
        clearMessages,
        filteredUsers,
        handleSearchChange,
        handleRoleFilterChange,
        handleCountryFilterChange,
        handleStatusFilterChange,
        handleAddUser,
        handleView,
        handleEdit,
        handleDelete,
        getUserTypeClass,
        formatDate,
        handlePageChange,
    };
};