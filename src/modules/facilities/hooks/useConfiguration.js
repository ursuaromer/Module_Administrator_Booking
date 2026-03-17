import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, CreditCard, Users, Banknote, Landmark, Wallet, UserCog } from 'lucide-react';
import userService from '../../users/services/userService';
import { useNodesState, useEdgesState, addEdge, MarkerType } from 'reactflow';
import configurationService from '../services/configurationService';
import companyService from '../services/companyService';
import { useCatalogs } from '../../../shared/hooks/useCatalogs';
import toast from 'react-hot-toast';
import { handleAxiosError } from '../../../shared/utils/errorHandler';

// Mapeo de iconos y colores por ID de tipo de pago
const PAYMENT_UI_CONFIG = {
    1: { icon: Banknote, color: '#4caf50' },    // Efectivo
    2: { icon: CreditCard, color: '#2196f3' },  // Tarjeta
    3: { icon: Landmark, color: '#ff9800' },    // Transferencia
    4: { icon: Wallet, color: '#9c27b0' },      // Billetera Digital (Yape/Plin)
    default: { icon: CreditCard, color: '#94a3b8' }
};

/**
 * Hook para gestionar la configuración de una compañía
 * Centraliza estados de branding, sucursales, métodos de pago y navegación
 */
export const useConfiguration = (companyId) => {
    const navigate = useNavigate();
    const { catalogs, loadPaymentTypes } = useCatalogs();

    // Estados básicos de datos
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);
    const [company, setCompany] = useState(null);
    const [subsidiaries, setSubsidiaries] = useState([]);
    const [error, setError] = useState(null);
    const [tenantStaff, setTenantStaff] = useState([]);
    // Controla si los edges de métodos ya fueron construidos para evitar sobrescritura
    const [paymentEdgesBuilt, setPaymentEdgesBuilt] = useState(false);

    // Estados de UI
    const [activeTab, setActiveTab] = useState('branding');
    const [selectedSubId, setSelectedSubId] = useState(null);
    const [isSavingPayments, setIsSavingPayments] = useState(false);

    // Estados de ReactFlow
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    /**
     * Manejador genérico para acciones asíncronas
     * Centraliza estados de carga, error y notificaciones usando mensajes del backend
     */
    const handleAsyncAction = useCallback(async (action, options = {}) => {
        const { showSuccess = true } = options;
        setLoading(true);
        setError(null);
        try {
            const response = await action();
            if (response.success) {
                if (showSuccess && response.message) {
                    toast.success(response.message);
                }
                return response;
            }
            throw new Error(response.message || 'Error en la operación');
        } catch (err) {
            const errorMessage = handleAxiosError(err);
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Configuración de pestañas
    const tabs = useMemo(() => [
        { id: 'branding',   label: 'Configuración',   icon: Settings  },
        { id: 'payments',   label: 'Métodos de Pago', icon: CreditCard },
        { id: 'admins',     label: 'Mis Admins',      icon: Users      },
        { id: 'empleados',  label: 'Empleados',       icon: UserCog    }
    ], []);

    // Cargar staff del tenant cuando cambie al tab de admins o empleados
    const loadTenantStaff = useCallback(async () => {
        if (!companyId) return;
        try {
            const res = await userService.getTenantStaff(companyId);
            setTenantStaff(res?.data || []);
        } catch {
            setTenantStaff([]);
        }
    }, [companyId]);

    useEffect(() => {
        if (activeTab === 'admins' || activeTab === 'empleados') {
            loadTenantStaff();
        }
    }, [activeTab, loadTenantStaff]);

    // Cargar tipos de pago al montar (necesario para reconstruir edges de configuraciones guardadas)
    useEffect(() => {
        loadPaymentTypes();
    }, [loadPaymentTypes]);

    // Transformar catálogo para la UI (solo lógica, sin HTML)
    const paymentMethods = useMemo(() => {
        return catalogs.paymentTypes.map(type => {
            const uiConfig = PAYMENT_UI_CONFIG[type.payment_type_id] || PAYMENT_UI_CONFIG.default;
            return {
                id: type.name.toLowerCase().replace(/\s+/g, '_'),
                label: type.name,
                icon: uiConfig.icon,
                color: uiConfig.color,
                db_id: type.payment_type_id,
                category: type.category,
                code: type.code
            };
        });
    }, [catalogs.paymentTypes]);

    // Cargar configuración inicial
    const fetchConfiguration = useCallback(async () => {
        if (!companyId) return;

        await handleAsyncAction(async () => {
            const [configRes, companyRes] = await Promise.all([
                configurationService.getConfiguration(companyId),
                companyService.getCompanyDetails(companyId)
            ]);

            if (configRes.success && companyRes.success) {
                // Si la configuración viene como null, significa que es una compañía nueva sin config
                if (!configRes.data) {
                    toast('¡Bienvenido! Completa la configuración de tu compañía para empezar.', {
                        icon: '👋',
                        duration: 5000
                    });
                    setConfig({}); // Estado vacío pero no nulo para evitar errores de renderizado
                } else {
                    setConfig(configRes.data);
                }

                setCompany(companyRes.data);
                const fetchedSubs = companyRes.data.subsidiaries || [];
                setSubsidiaries(fetchedSubs);

                return { success: true };
            }
            return { success: false, message: 'No se pudo cargar la configuración completa' };
        }, { showSuccess: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId, handleAsyncAction]);

    useEffect(() => {
        fetchConfiguration();
    }, [fetchConfiguration]);

    // Reconstruir edges de métodos de pago cuando ambos datos estén disponibles.
    // Se ejecuta solo una vez (paymentEdgesBuilt previene re-ejecuciones tras ediciones manuales).
    useEffect(() => {
        if (paymentEdgesBuilt || !subsidiaries.length || !paymentMethods.length) return;

        const methodEdges = [];
        subsidiaries.forEach(sub => {
            if (!sub.paymentConfigurations?.length) return;
            const sorted = [...sub.paymentConfigurations].sort((a, b) => a.sort_order - b.sort_order);
            sorted.forEach(cfg => {
                const method = paymentMethods.find(m => String(m.db_id) === String(cfg.payment_type_id));
                if (method) {
                    methodEdges.push({
                        id: `e-sub-${sub.sucursal_id}-method-${method.id}`,
                        source: `sub-${sub.sucursal_id}`,
                        target: `method-${method.id}`,
                        animated: true,
                        style: { stroke: method.color, strokeWidth: 2 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: method.color }
                    });
                }
            });
        });

        if (methodEdges.length > 0) {
            setEdges(prev => [
                ...prev.filter(e => e.source === 'company-main'),
                ...methodEdges
            ]);
        }
        setPaymentEdgesBuilt(true);
    }, [subsidiaries, paymentMethods, paymentEdgesBuilt, setEdges]);

    // Lógica de guardado de branding
    const saveConfiguration = useCallback(async (configData) => {
        const result = await handleAsyncAction(async () => {
            const response = await configurationService.saveConfiguration(companyId, configData);
            if (response.success) {
                setConfig(response.data);
            }
            return response;
        });

        return !!result;
    }, [companyId, handleAsyncAction]);

    // Lógica de Métodos de Pago
    const selectedSub = useMemo(() =>
        subsidiaries.find(s => `sub-${s.sucursal_id}` === selectedSubId),
        [subsidiaries, selectedSubId]);

    const connectedMethods = useMemo(() => {
        if (!selectedSubId) return [];
        return edges
            .filter(edge => edge.source === selectedSubId)
            .map(edge => {
                const method = paymentMethods.find(m => `method-${m.id}` === edge.target);
                // Buscar configuration_payment_id desde las configuraciones guardadas de la sucursal
                const configPayment = selectedSub?.paymentConfigurations?.find(
                    cfg => String(cfg.payment_type_id) === String(method?.db_id)
                );
                return {
                    ...method,
                    edgeId: edge.id,
                    configuration_payment_id: configPayment?.configuration_payment_id || null
                };
            });
    }, [edges, selectedSubId, paymentMethods, selectedSub]);

    const onConnect = useCallback((params) => {
        if (params.source.startsWith('sub-') && params.target.startsWith('method-')) {
            const exists = edges.some(e => e.source === params.source && e.target === params.target);
            if (exists) return;

            const methodColor = paymentMethods.find(m => `method-${m.id}` === params.target)?.color || '#94a3b8';
            const newEdge = {
                ...params,
                id: `e-${params.source}-${params.target}`,
                animated: true,
                style: { stroke: methodColor, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: methodColor }
            };
            setEdges((eds) => addEdge(newEdge, eds));
        }
    }, [edges, paymentMethods, setEdges]);

    const onNodeClick = useCallback((event, node) => {
        setSelectedSubId(node.id.startsWith('sub-') ? node.id : null);
    }, []);

    const movePaymentItem = useCallback((index, direction) => {
        setEdges(prevEdges => {
            const newEdges = [...prevEdges];
            const subEdgesIndices = prevEdges
                .map((e, i) => (e.source === selectedSubId ? i : -1))
                .filter(i => i !== -1);

            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            if (targetIndex >= 0 && targetIndex < subEdgesIndices.length) {
                const idx1 = subEdgesIndices[index];
                const idx2 = subEdgesIndices[targetIndex];
                [newEdges[idx1], newEdges[idx2]] = [newEdges[idx2], newEdges[idx1]];
            }
            return newEdges;
        });
    }, [selectedSubId, setEdges]);

    const removePaymentMethod = useCallback((edgeId) => {
        setEdges(eds => eds.filter(e => e.id !== edgeId));
    }, [setEdges]);

    const saveActivePayments = useCallback(async () => {
        if (!selectedSubId) return;

        await handleAsyncAction(async () => {
            setIsSavingPayments(true);
            try {
                const sucursalId = selectedSubId.replace('sub-', '');
                const methodsData = connectedMethods.map((m, index) => ({
                    payment_type_id: m.db_id,
                    is_enabled: true,
                    sort_order: index
                }));
                const result = await configurationService.saveActivePayments(sucursalId, methodsData);
                // Recargar config para que los nuevos paymentConfigurations estén sincronizados
                await fetchConfiguration();
                setPaymentEdgesBuilt(false);
                return result;
            } finally {
                setIsSavingPayments(false);
            }
        });
    }, [selectedSubId, connectedMethods, handleAsyncAction, fetchConfiguration]);

    return {
        config,
        company,
        subsidiaries,
        loading,
        error,
        activeTab,
        tabs,
        paymentMethods,
        selectedSubId,
        selectedSub,
        connectedMethods,
        isSavingPayments,
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        onConnect,
        onNodeClick,
        movePaymentItem,
        removePaymentMethod,
        saveActivePayments,
        saveConfiguration,
        handleBack: () => navigate(-1),
        changeTab: (tabId) => setActiveTab(tabId),
        tenantStaff,
        loadTenantStaff
    };
};
