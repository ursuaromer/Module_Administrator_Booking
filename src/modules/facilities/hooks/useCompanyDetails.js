import { useCallback, useEffect, useState } from 'react';
import companyService from '../services/companyService';
import toast from 'react-hot-toast';
import { handleAxiosError } from '../../../shared/utils/errorHandler';
import { useNavigate } from 'react-router-dom';

import { formatDate, getStatusClass, getStatusText } from '../../../shared/utils/formarText';

/**
 * Hook para el manejo de detalles de una compañía específica
 * Proporciona acceso a la información completa de la compañía y sus sucursales
 */
export const useCompanyDetails = (companyId) => {
    const navigate = useNavigate();
    const [companyDetails, setCompanyDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingEnabled, setLoadingEnabled] = useState(false);

    const handleAction = useCallback(async (action, loadingSetter, showSuccessToast = true) => {
        loadingSetter(true);
        setError(null);
        try {
            const payload = await action();
            setCompanyDetails(payload.data);
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

    const loadCompanyDetails = useCallback((id) => {
        if (!id) return setError('ID de compañía no proporcionado');
        return handleAction(() => companyService.getCompanyDetails(id), setLoading, false);
    }, [handleAction]);

    const activeInactiveCompany = useCallback((id) => {
        if (!id) return toast.error('Id de compañía no proporcionado');
        return handleAction(() => companyService.activeInactiveCompany(id), setLoadingEnabled);
    }, [handleAction]);

    useEffect(() => {
        if (companyId) loadCompanyDetails(companyId);
    }, [companyId, loadCompanyDetails]);

    const handlerViewSubsidiary = useCallback((id) => {
        navigate(`/subsidiary/${id}`);
    }, [navigate]);

    const handlerEditSubsidiary = useCallback((id) => {
        navigate(`/subsidiary/${id}/edit`);
    }, [navigate]);

    return {
        companyDetails,
        loading,
        loadingEnabled,
        error,
        loadCompanyDetails,
        formatDate,
        getStatusClass,
        getStatusText,
        handlerViewSubsidiary,
        handlerEditSubsidiary,
        activeInactiveCompany,
    };
};
