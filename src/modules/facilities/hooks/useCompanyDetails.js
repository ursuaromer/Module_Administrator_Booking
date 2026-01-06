import { useCallback, useEffect, useState } from 'react';
import companyService from '../services/companyService';
import toast from 'react-hot-toast';

/**
 * Hook para el manejo de detalles de una compañía específica
 * Proporciona acceso a la información completa de la compañía y sus sucursales
 */
export const useCompanyDetails = (companyId) => {
    const [companyDetails, setCompanyDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar detalles de la compañía
    const loadCompanyDetails = useCallback(async (id) => {
        if (!id) {
            setError('ID de compañía no proporcionado');
            return;
        }

        setLoading(true);
        setError(null);
        
        const payload = await companyService.getCompanyDetails(id);
        if (payload?.success) {
            setCompanyDetails(payload.data);
            toast.success(payload.message)
        } else {
            const errorMessage = payload?.error?.message || 'Error al cargar los detalles de la compañía';
            setError(errorMessage);
            toast.error(errorMessage);
        }
        setLoading(false);
    }, []);

    // Cargar detalles al montar el componente
    useEffect(() => {
        if (companyId) {
            loadCompanyDetails(companyId);
        }
    }, [companyId, loadCompanyDetails]);

    // Formatear fecha
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    }, []);

    // Obtener clase de estado
    const getStatusClass = useCallback((isEnabled) => {
        return isEnabled === 'A' ? 'status-active' : 'status-inactive';
    }, []);

    // Obtener texto de estado
    const getStatusText = useCallback((isEnabled) => {
        return isEnabled === 'A' ? 'Activo' : 'Inactivo';
    }, []);

    return {
        companyDetails,
        loading,
        error,
        loadCompanyDetails,
        formatDate,
        getStatusClass,
        getStatusText,
    };
};
