import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import companyService from '../services/companyService';
import toast from 'react-hot-toast';

/**
 * Hook para el manejo del estado de compañías
 * Proporciona acceso centralizado a la lista de compañías y funciones CRUD
 */
export const useCompany = ({ autoLoad = true } = {}) => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Limpiar mensajes
    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    // Cargar todas las compañías
    const loadCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const payload = await companyService.getAllCompanies();
        if (payload?.success) {
            setCompanies(payload.data);
        } else {
            const errorMessage = payload?.error?.message || 'Error al cargar las compañías';
            setError(errorMessage);
            toast.error(errorMessage);
        }
        setLoading(false);
    }, []);

    // Filtrar compañías con múltiples criterios
    const filterCompanies = useCallback((filters = {}) => {
        const { searchTerm, countryFilter, statusFilter } = filters;
        let filtered = [...companies];

        // Filtro por término de búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(company => 
                company.name?.toLowerCase().includes(term) ||
                company.document?.toLowerCase().includes(term) ||
                company.address?.toLowerCase().includes(term)
            );
        }

        // Filtro por país
        if (countryFilter) {
            filtered = filtered.filter(company => 
                company.country?.name === countryFilter
            );
        }

        // Filtro por estado
        if (statusFilter) {
            const isActive = statusFilter === 'Activo' ? 'A' : 'I';
            filtered = filtered.filter(company => 
                company.is_enabled === isActive
            );
        }

        return filtered;
    }, [companies]);

    // Obtener países únicos
    const getUniqueCountries = useCallback(() => {
        return [...new Set(companies.map(company => company.country?.name).filter(Boolean))];
    }, [companies]);

    const uniqueCountries = useMemo(() => getUniqueCountries(), [getUniqueCountries]);

    const filteredCompanies = useMemo(() => {
        return filterCompanies({ searchTerm, countryFilter, statusFilter });
    }, [filterCompanies, searchTerm, countryFilter, statusFilter]);

    const totalCompanies = useMemo(() => companies.length, [companies.length]);
    const activeCompanies = useMemo(() => companies.filter(company => company.is_enabled === 'A').length, [companies]);
    const inactiveCompanies = useMemo(() => totalCompanies - activeCompanies, [totalCompanies, activeCompanies]);

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
    const handleCountryFilterChange = useCallback((e) => setCountryFilter(e.target.value), []);
    const handleStatusFilterChange = useCallback((e) => setStatusFilter(e.target.value), []);

    const handleChangeRegister = useCallback(() => {
        navigate('/dashboard/companys/register');
        toast.success('Registrar Nueva Empresa');
    }, [navigate]);

    const handleView = useCallback((company) => {
        const companyId = company.id || company.company_id;
        if (!companyId) return;
        navigate(`/dashboard/companys/${companyId}`);
    }, [navigate]);

    const handleEdit = useCallback((company) => {
        toast.success(`Editar: ${company?.name || ''}`);
    }, []);

    const handleDelete = useCallback((companyId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
            toast.success('Funcionalidad de eliminación pendiente de implementar');
        }
    }, []);

    const getStatusClass = useCallback((isEnabled) => {
        return isEnabled === 'A' ? 'status-active' : 'status-inactive';
    }, []);

    const getStatusText = useCallback((isEnabled) => {
        return isEnabled === 'A' ? 'Activo' : 'Inactivo';
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    }, []);

    useEffect(() => {
        if (!autoLoad) return;
        loadCompanies();
    }, [autoLoad, loadCompanies]);

    // Registrar nueva compañía
    const registerCompany = useCallback(async (companyData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const payload = await companyService.registerCompany(companyData);
        if (payload?.success) {
            setSuccess(payload.message || 'Creado exitosamente');
            await loadCompanies();
            setLoading(false);
            return payload;
        }

        const errorMessage = payload?.error?.message || 'Error al registrar la empresa';
        setError(errorMessage);
        setLoading(false);
        return payload || { success: false, error: { message: errorMessage } };
    }, [loadCompanies]);

    return {
        // Estado
        companies,
        loading,
        error,
        success,
        searchTerm,
        countryFilter,
        statusFilter,
        
        // Acciones
        loadCompanies,
        filterCompanies,
        registerCompany,
        clearMessages,
        getUniqueCountries,
        uniqueCountries,
        filteredCompanies,
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        handleSearchChange,
        handleCountryFilterChange,
        handleStatusFilterChange,
        handleChangeRegister,
        handleView,
        handleEdit,
        handleDelete,
        getStatusClass,
        getStatusText,
        formatDate,
    };
};
