import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import companyService from '../services/companyService';
import toast from 'react-hot-toast';
import { handleAxiosError } from '../../../shared/utils/errorHandler';
import { useCatalogs } from '../../../shared/hooks/useCatalogs';

/**
 * Hook para el manejo del estado de compañías
 * Proporciona acceso centralizado a la lista de compañías y funciones CRUD
 */
export const useCompanyList = ({ autoLoad = true } = {}) => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 20,
    });
    const searchTimeoutRef = useRef(null);
    const lastSearchTermRef = useRef('');

    // Usar el hook useCatalogs para obtener la lista de países desde el backend
    const {
        catalogs,
        loadCountries,
        isLoadingCountries
    } = useCatalogs();

    // Cargar países al inicializar
    useEffect(() => {
        loadCountries();
    }, [loadCountries]);

    // Limpiar mensajes
    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    // Cargar todas las compañías con filtros desde el backend
    const loadCompanies = useCallback(async ({ 
        page = 1, 
        limit = 20, 
        search, 
        country_id, 
        status 
    } = {}) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                limit,
                ...(search ? { search } : {}),
                ...(country_id ? { country_id } : {}),
                ...(status ? { status } : {})
            };

            const payload = await companyService.getAllCompanies(params);
            
            setCompanies(payload.data);
            setPagination({
                total: payload.pagination.total,
                totalPages: payload.pagination.totalPages,
                page: payload.pagination.page,
                limit: payload.pagination.limit,
            });
            return payload;
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Funcion para cambiar de pagina
    const handlePageChange = useCallback((nextPage) => {
        const term = searchTerm.trim();
        loadCompanies({ 
            page: nextPage, 
            limit: pagination.limit, 
            search: term.length >= 2 ? term : undefined,
            country_id: countryFilter || undefined,
            status: statusFilter || undefined
        });
    }, [loadCompanies, pagination.limit, searchTerm, countryFilter, statusFilter]);

    const totalCompanies = useMemo(() => pagination.total, [pagination.total]);
    // Nota: Las estadísticas active/inactive ahora deberían venir del backend si se requiere precisión total,
    // por ahora mantendremos el cálculo sobre la página actual o lo omitiremos si el backend no lo provee.
    const activeCompanies = useMemo(() => companies.filter(company => company.is_enabled === 'A').length, [companies]);
    const inactiveCompanies = useMemo(() => companies.filter(company => company.is_enabled === 'I').length, [companies]);

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
    const handleCountryFilterChange = useCallback((e) => setCountryFilter(e.target.value), []);
    const handleStatusFilterChange = useCallback((e) => setStatusFilter(e.target.value), []);

    const handleChangeRegister = useCallback(() => {
        navigate('/companys/register');
        toast.success('Registrar Nueva Empresa');
    }, [navigate]);

    const handleView = useCallback((companyId) => {
        navigate(`/companys/${companyId}`);
    }, [navigate]);

    const handleEdit = useCallback((companyId) => {
        navigate(`/companys/${companyId}/edit`)
    }, [navigate]);

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

    // Efecto para cargar datos cuando cambian los filtros (país o estado)
    useEffect(() => {
        if (!autoLoad) return;
        loadCompanies({ 
            page: 1, 
            limit: pagination.limit,
            country_id: countryFilter || undefined,
            status: statusFilter || undefined,
            search: searchTerm.length >= 2 ? searchTerm : undefined
        });
    }, [autoLoad, loadCompanies, pagination.limit, countryFilter, statusFilter]);

    // Efecto para búsqueda con debounce
    useEffect(() => {
        if (!autoLoad) return;

        const term = searchTerm.trim();
        const prevTerm = lastSearchTermRef.current;
        lastSearchTermRef.current = term;

        if (term === '' && prevTerm === '') return;
        if (term.length === 1) return; // No buscar con solo 1 caracter

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            loadCompanies({ 
                page: 1, 
                limit: pagination.limit, 
                search: term.length >= 2 ? term : undefined,
                country_id: countryFilter || undefined,
                status: statusFilter || undefined
            });
        }, 1000);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [autoLoad, loadCompanies, pagination.limit, searchTerm]);


    // Registrar nueva compañía o sucursal
    const registerCompany = useCallback(async (companyData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = await companyService.registerCompany(companyData);
            setSuccess(payload.message || 'Creado exitosamente');
            await loadCompanies({ page: 1, limit: pagination.limit });
            return payload; // Devolver el payload con el message
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            setError(errorMessage);
            toast.error(errorMessage);
            throw error; // Re-lanzar el error para que el hook useCompanyForm lo maneje
        } finally {
            setLoading(false)
        }
    }, [loadCompanies, pagination.limit]);

    const updateCompany = useCallback(async (companyId, companyData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = await companyService.updateCompany(companyId, companyData);

            setSuccess(payload.message || 'Actualizado exitosamente');
            await loadCompanies({ page: 1, limit: pagination.limit });
            return payload; // Devolver el payload con el message
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            setError(errorMessage);
            toast.error(errorMessage);
            throw error; // Re-lanzar el error para que el hook useCompanyForm lo maneje
        } finally {
            setLoading(false)
        }
    }, [loadCompanies, pagination.limit]);

    return {
        // Estado
        companies,
        loading,
        error,
        success,
        searchTerm,
        countryFilter,
        statusFilter,
        pagination,
        countries: catalogs.countries,
        isLoadingCountries,

        // Acciones
        loadCompanies,
        registerCompany,
        updateCompany,
        clearMessages,
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        handleSearchChange,
        handleCountryFilterChange,
        handleStatusFilterChange,
        handleChangeRegister,
        handleView,
        handleEdit,
        getStatusClass,
        getStatusText,
        formatDate,
        handlePageChange,
    };
};
