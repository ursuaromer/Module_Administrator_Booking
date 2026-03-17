import { useCallback, useEffect, useState } from 'react';
import companyService from '../services/companyService';
import toast from 'react-hot-toast';
import { handleAxiosError } from '../../../shared/utils/errorHandler';
import { useNavigate } from 'react-router-dom';

import { formatDate, getStatusClass, getStatusText } from '../../../shared/utils/formarText';

/**
 * Hook para el manejo de detalles de una sucursal específica
 * Proporciona acceso a la información completa de la sucursal
 */
export const useSucursalDetails = (sucursalId) => {
    const navigate = useNavigate();
    const [sucursalDetails, setSucursalDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingEnabled, setLoadingEnabled] = useState(false);

    const handleAction = useCallback(async (action, loadingSetter, showSuccessToast = true) => {
        loadingSetter(true);
        setError(null);
        try {
            const payload = await action();
            setSucursalDetails(payload.data);
            if (showSuccessToast) toast.success(payload.message);
            return payload;
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            loadingSetter(false);
        }
    }, []);

    const loadSucursalDetails = useCallback((id) => {
        if (!id) return setError('ID de sucursal no proporcionado');
        return handleAction(() => companyService.getCompanyDetails(id), setLoading, false);
    }, [handleAction]);

    const activeInactiveSucursal = useCallback((id) => {
        if (!id) return toast.error('Id de sucursal no proporcionado');
        return handleAction(() => companyService.activeInactiveCompany(id), setLoadingEnabled);
    }, [handleAction]);

    useEffect(() => {
        if (sucursalId) loadSucursalDetails(sucursalId);
    }, [sucursalId, loadSucursalDetails]);

    return {
        sucursalDetails,
        loading,
        loadingEnabled,
        error,
        loadSucursalDetails,
        formatDate,
        getStatusClass,
        getStatusText,
        activeInactiveSucursal,
    };
};