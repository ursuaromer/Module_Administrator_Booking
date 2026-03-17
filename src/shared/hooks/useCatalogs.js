import { useState, useEffect, useCallback } from 'react';
import CatalogService from '../services/catalogService';

/**
 * Hook global para manejo de catálogos del sistema
 * Proporciona acceso centralizado a países, deportes, departamentos, etc.
 * Incluye manejo de caché y estados de carga
 */
export const useCatalogs = () => {
    // ==================== ESTADOS ====================

    const [catalogs, setCatalogs] = useState({
        countries: [],
        sportTypes: [],
        departments: [],
        districts: [],
        surfaceTypes: [],
        sportCategories: [],
        roles: [],
        paymentTypes: []
    });

    const [loading, setLoading] = useState({
        countries: false,
        sportTypes: false,
        departments: false,
        districts: false,
        surfaceTypes: false,
        sportCategories: false,
        roles: false,
        paymentTypes: false
    });

    const [errors, setErrors] = useState({
        countries: null,
        sportTypes: null,
        departments: null,
        districts: null,
        surfaceTypes: null,
        sportCategories: null,
        roles: null,
        paymentTypes: null
    });

    // ==================== FUNCIONES DE CARGA ====================

    /**
     * Carga países
     */
    const loadCountries = useCallback(async () => {
        if (catalogs.countries.length > 0) return; // Ya cargados

        try {
            setLoading(prev => ({ ...prev, countries: true }));
            setErrors(prev => ({ ...prev, countries: null }));

            const countries = await CatalogService.getCountries();
            setCatalogs(prev => ({ ...prev, countries }));
        } catch (error) {
            setErrors(prev => ({ ...prev, countries: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, countries: false }));
        }
    }, [catalogs.countries.length]);

    /**
     * Carga tipos de deporte
     */
    const loadSportTypes = useCallback(async () => {
        if (catalogs.sportTypes.length > 0) return; // Ya cargados

        try {
            setLoading(prev => ({ ...prev, sportTypes: true }));
            setErrors(prev => ({ ...prev, sportTypes: null }));

            const sportTypes = await CatalogService.getSportTypes();
            setCatalogs(prev => ({ ...prev, sportTypes }));
        } catch (error) {
            setErrors(prev => ({ ...prev, sportTypes: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, sportTypes: false }));
        }
    }, [catalogs.sportTypes.length]);

    /**
     * Carga departamentos por país
     */
    const loadDepartmentsByCountry = useCallback(async (countryId) => {
        try {
            setLoading(prev => ({ ...prev, departments: true }));
            setErrors(prev => ({ ...prev, departments: null }));

            const departments = await CatalogService.getDepartmentsByCountry(countryId);
            setCatalogs(prev => ({ ...prev, departments }));
        } catch (error) {
            setErrors(prev => ({ ...prev, departments: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, departments: false }));
        }
    }, []);

    /**
     * Carga distritos por departamento
     */
    const loadDistrictsByDepartment = useCallback(async (departmentId) => {
        try {
            setLoading(prev => ({ ...prev, districts: true }));
            setErrors(prev => ({ ...prev, districts: null }));

            const districts = await CatalogService.getDistrictsByDepartment(departmentId);
            setCatalogs(prev => ({ ...prev, districts }));
        } catch (error) {
            setErrors(prev => ({ ...prev, districts: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, districts: false }));
        }
    }, []);

    /**
     * Carga tipos de superficie
     */
    const loadSurfaceTypes = useCallback(async () => {
        if (catalogs.surfaceTypes.length > 0) return; // Ya cargados

        try {
            setLoading(prev => ({ ...prev, surfaceTypes: true }));
            setErrors(prev => ({ ...prev, surfaceTypes: null }));

            const surfaceTypes = await CatalogService.getSurfaceTypes();
            setCatalogs(prev => ({ ...prev, surfaceTypes }));
        } catch (error) {
            setErrors(prev => ({ ...prev, surfaceTypes: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, surfaceTypes: false }));
        }
    }, [catalogs.surfaceTypes.length]);

    /**
     * Carga categorías de deporte
     */
    const loadSportCategories = useCallback(async () => {
        if (catalogs.sportCategories.length > 0) return; // Ya cargados

        try {
            setLoading(prev => ({ ...prev, sportCategories: true }));
            setErrors(prev => ({ ...prev, sportCategories: null }));

            const sportCategories = await CatalogService.getSportCategories();
            setCatalogs(prev => ({ ...prev, sportCategories }));
        } catch (error) {
            setErrors(prev => ({ ...prev, sportCategories: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, sportCategories: false }));
        }
    }, [catalogs.sportCategories.length]);

    /**
     * Carga roles
     */
    const loadRoles = useCallback(async () => {
        if (catalogs.roles.length > 0) return; // Ya cargados

        try {
            setLoading(prev => ({ ...prev, roles: true }));
            setErrors(prev => ({ ...prev, roles: null }));

            const roles = await CatalogService.getRoles();
            setCatalogs(prev => ({ ...prev, roles }));
        } catch (error) {
            setErrors(prev => ({ ...prev, roles: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, roles: false }));
        }
    }, [catalogs.roles.length]);

    /**
     * Carga tipos de pago
     */
    const loadPaymentTypes = useCallback(async () => {
        if (catalogs.paymentTypes.length > 0) return; // Ya cargados

        try {
            setLoading(prev => ({ ...prev, paymentTypes: true }));
            setErrors(prev => ({ ...prev, paymentTypes: null }));

            const paymentTypes = await CatalogService.getPaymentTypes();
            setCatalogs(prev => ({ ...prev, paymentTypes }));
        } catch (error) {
            setErrors(prev => ({ ...prev, paymentTypes: error.message }));
        } finally {
            setLoading(prev => ({ ...prev, paymentTypes: false }));
        }
    }, [catalogs.paymentTypes.length]);

    // ==================== FUNCIONES DE UTILIDAD ====================

    /**
     * Limpia departamentos y distritos cuando cambia el país
     */
    const clearLocationData = useCallback(() => {
        setCatalogs(prev => ({
            ...prev,
            departments: [],
            districts: []
        }));
    }, []);

    /**
     * Limpia distritos cuando cambia el departamento
     */
    const clearDistricts = useCallback(() => {
        setCatalogs(prev => ({
            ...prev,
            districts: []
        }));
    }, []);

    /**
     * Refresca un catálogo específico
     */
    const refreshCatalog = useCallback(async (catalogType) => {
        switch (catalogType) {
            case 'countries':
                setCatalogs(prev => ({ ...prev, countries: [] }));
                await loadCountries();
                break;
            case 'sportTypes':
                setCatalogs(prev => ({ ...prev, sportTypes: [] }));
                await loadSportTypes();
                break;
            case 'surfaceTypes':
                setCatalogs(prev => ({ ...prev, surfaceTypes: [] }));
                await loadSurfaceTypes();
                break;
            case 'sportCategories':
                setCatalogs(prev => ({ ...prev, sportCategories: [] }));
                await loadSportCategories();
                break;
            case 'roles':
                setCatalogs(prev => ({ ...prev, roles: [] }));
                await loadRoles();
                break;
            case 'paymentTypes':
                setCatalogs(prev => ({ ...prev, paymentTypes: [] }));
                await loadPaymentTypes();
                break;
            default:
                console.warn(`Tipo de catálogo no reconocido: ${catalogType}`);
        }
    }, [loadCountries, loadSportTypes, loadSurfaceTypes, loadSportCategories, loadRoles, loadPaymentTypes]);

    // ==================== RETORNO DEL HOOK ====================

    return {
        // Datos
        catalogs,

        // Estados de carga
        loading,

        // Errores
        errors,

        // Funciones de carga
        loadCountries,
        loadSportTypes,
        loadDepartmentsByCountry,
        loadDistrictsByDepartment,
        loadSurfaceTypes,
        loadSportCategories,
        loadRoles,
        loadPaymentTypes,

        // Funciones de utilidad
        clearLocationData,
        clearDistricts,
        refreshCatalog,

        // Getters de conveniencia
        getCountriesForSelect: () => catalogs.countries.map(c => ({
            value: c.country_id,
            label: c.country
        })),
        getSportTypesForSelect: () => catalogs.sportTypes,
        getDepartmentsForSelect: () => catalogs.departments,
        getDistrictsForSelect: () => catalogs.districts,
        getSurfaceTypesForSelect: () => catalogs.surfaceTypes,
        getSportCategoriesForSelect: () => catalogs.sportCategories,
        getRolesForSelect: () => catalogs.roles,
        getPaymentTypesForSelect: () => catalogs.paymentTypes,

        // Estados de carga específicos
        isLoadingCountries: loading.countries,
        isLoadingSportTypes: loading.sportTypes,
        isLoadingDepartments: loading.departments,
        isLoadingDistricts: loading.districts,
        isLoadingSurfaceTypes: loading.surfaceTypes,
        isLoadingSportCategories: loading.sportCategories,
        isLoadingRoles: loading.roles,
        isLoadingPaymentTypes: loading.paymentTypes,

        // Errores específicos
        countriesError: errors.countries,
        sportTypesError: errors.sportTypes,
        departmentsError: errors.departments,
        districtsError: errors.districts,
        surfaceTypesError: errors.surfaceTypes,
        sportCategoriesError: errors.sportCategories,
        rolesError: errors.roles,
        paymentTypesError: errors.paymentTypes
    };
};