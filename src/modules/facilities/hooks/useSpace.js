import { useState, useCallback, useEffect } from 'react';
import spaceService from '../services/spaceService';
import toast from 'react-hot-toast';
import { handleAxiosError } from '../../../shared/utils/errorHandler';
import { formatDate, getStatusClass, getStatusText } from '../../../shared/utils/formarText';

export const DAYS_OF_WEEK = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' }
];

export const useSpace = (spaceId = null, initialSchedules = null) => {
    const [loading, setLoading] = useState(false);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [error, setError] = useState(null);
    const [spaceDetails, setSpaceDetails] = useState(null);
    const [showSchedulesModal, setShowSchedulesModal] = useState(false);
    const [showMediaForm, setShowMediaForm] = useState(false);

    // Estados para la gestión de horarios en el formulario
    const [schedules, setSchedules] = useState({});
    const [activeDay, setActiveDay] = useState('SUMMARY');
    const [copying, setCopying] = useState(false);

    /**
     * Agrupa una lista plana de horarios por su día de la semana
     * Útil para inicializar el estado del formulario de horarios
     */
    const groupSchedulesByDay = useCallback((schedulesList) => {
        const grouped = {};
        DAYS_OF_WEEK.forEach(day => grouped[day.value] = []);
        
        if (!schedulesList || schedulesList.length === 0) return grouped;

        schedulesList.forEach(sched => {
            const dayKey = sched.day_of_week || sched.day;
            if (dayKey && grouped[dayKey]) {
                grouped[dayKey].push({
                    id: sched.hour_id || sched.id,
                    day_of_week: dayKey,
                    start_time: (sched.start_time || '').substring(0, 5),
                    end_time: (sched.end_time || '').substring(0, 5),
                    price: sched.price,
                    is_closed: sched.is_closed !== undefined ? sched.is_closed : false
                });
            }
        });
        return grouped;
    }, []);

    /**
     * Manejador genérico para acciones asíncronas (registro, actualización, etc.)
     * Gestiona estados de carga, error y notificaciones automáticas
     */
    const handleAction = useCallback(async (action, showSuccessToast = true, loadingSetter = setLoading, updateGlobalError = true) => {
        loadingSetter(true);
        if (updateGlobalError) setError(null);
        try {
            const data = await action();
            if (showSuccessToast) toast.success(data.message);
            return data;
        } catch (err) {
            const errorMessage = handleAxiosError(err);
            if (updateGlobalError) setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            loadingSetter(false);
        }
    }, []);

    /**
     * Registra un nuevo espacio deportivo en la sucursal
     */
    const registerSpace = useCallback(async (spaceData) => {
        const data = await handleAction(() => spaceService.registerSpace(spaceData));
        if (data) setSpaceDetails(data.data);
        return data;
    }, [handleAction]);

    /**
     * Actualiza la información básica de un espacio existente
     */
    const updateSpace = useCallback(async (spaceId, spaceData) => {
        const data = await handleAction(() => spaceService.updateSpace(spaceId, spaceData));
        if (data) setSpaceDetails(data.data);
        return data;
    }, [handleAction]);

    /**
     * Obtiene solo los detalles básicos de un espacio (sin horarios)
     */
    const getSpaceDetails = useCallback(async (id) => {
        const data = await handleAction(() => spaceService.getSpaceDetails(id), false, setLoading);
        if (data) setSpaceDetails(data.data);
        return data;
    }, [handleAction]);

    /**
     * Obtiene solo los horarios de un espacio
     */
    const getSpaceSchedules = useCallback(async (id) => {
        const data = await handleAction(() => spaceService.getSpaceSchedules(id), false, setLoadingSchedules);
        if (data) {
            setSchedules(groupSchedulesByDay(data.data));
        }
        return data;
    }, [handleAction, groupSchedulesByDay]);

    /**
     * Envía la lista de horarios al servidor para su creación o actualización masiva
     */
    const createSchedules = useCallback((id, schedulesData) => 
        handleAction(() => spaceService.createSchedules(id, schedulesData), true, setLoadingSchedules, false), 
    [handleAction]);

    /**
     * Activa o inactiva (cierra/abre) todos los horarios de un día específico
     */
    const toggleDayStatus = useCallback(async (id, dayOfWeek, isClosed) => {
        const toastId = toast.loading(isClosed ? 'Desactivando día...' : 'Activando día...');
        try {
            const data = await spaceService.toggleDayStatus(id, dayOfWeek, isClosed);
            toast.success(data.message, { id: toastId });
            return data;
        } catch (err) {
            const errorMessage = handleAxiosError(err);
            toast.error(errorMessage, { id: toastId });
            return null;
        }
    }, []);

    /**
     * Sube un archivo multimedia (imagen o video)
     */
    const uploadMedia = useCallback((id, formData) => 
        handleAction(() => spaceService.uploadMedia(id, formData)), 
    [handleAction]);

    /**
     * Elimina un archivo multimedia
     */
    const deleteMedia = useCallback((mediaId) => 
        handleAction(() => spaceService.deleteMedia(mediaId)), 
    [handleAction]);

    /**
     * Marca un archivo multimedia como principal
     */
    const setPrimaryMedia = useCallback((id, mediaId) => 
        handleAction(() => spaceService.setPrimaryMedia(id, mediaId)), 
    [handleAction]);

    /**
     * Refresca los detalles del espacio actual
     */
    const refreshDetails = useCallback(() => {
        if (spaceId) {
            getSpaceDetails(spaceId);
            getSpaceSchedules(spaceId);
        }
    }, [spaceId, getSpaceDetails, getSpaceSchedules]);

    /**
     * Elimina un archivo multimedia y refresca la información
     */
    const handleDeleteMedia = useCallback(async (mediaId) => {
        const data = await deleteMedia(mediaId);
        if (data) refreshDetails();
    }, [deleteMedia, refreshDetails]);

    /**
     * Marca multimedia como principal y refresca
     */
    const handleSetPrimaryMedia = useCallback(async (mediaId) => {
        const data = await setPrimaryMedia(spaceId, mediaId);
        if (data) refreshDetails();
    }, [spaceId, setPrimaryMedia, refreshDetails]);

    /**
     * Guarda los horarios editados en el backend y refresca la vista
     */
    const handleSaveSchedules = useCallback(async (id, flatSchedules) => {
        const data = await createSchedules(id, flatSchedules);
        if (data) {
            // Solo refrescamos los horarios, no los detalles del espacio
            getSpaceSchedules(id);
        }
    }, [createSchedules, getSpaceSchedules]);

    /**
     * Cambia el estado de todos los horarios de un día y refresca la información
     */
    const handleToggleDayStatus = useCallback(async (dayOfWeek, isCurrentlyActive) => {
        // Si está activo (isCurrentlyActive=true), queremos cerrarlo (isClosed=true)
        // Si está inactivo (isCurrentlyActive=false), queremos abrirlo (isClosed=false)
        const newIsClosed = isCurrentlyActive; 
        const toastId = toast.loading(newIsClosed ? 'Desactivando día...' : 'Activando día...');

        try {
            const data = await spaceService.toggleDayStatus(spaceId, dayOfWeek, newIsClosed);
            
            // Actualizar estado localmente para reflejar el cambio sin recargar todo y sin loading global
            setSchedules(prev => {
                const newSchedules = { ...prev };
                if (newSchedules[dayOfWeek]) {
                    newSchedules[dayOfWeek] = newSchedules[dayOfWeek].map(slot => ({
                        ...slot,
                        is_closed: newIsClosed
                    }));
                }
                return newSchedules;
            });

            toast.success(data.message || (newIsClosed ? 'Día desactivado' : 'Día activado'), { id: toastId });
        } catch (err) {
            const errorMessage = handleAxiosError(err);
            toast.error(errorMessage, { id: toastId });
        }
    }, [spaceId, setSchedules]);

    /**
     * Agrega un nuevo bloque de horario al día activo en el formulario
     */
    const handleAddTimeSlot = useCallback(() => {
        if (activeDay === 'SUMMARY') return;
        setSchedules(prev => ({
            ...prev,
            [activeDay]: [
                ...prev[activeDay],
                { start_time: '08:00', end_time: '09:00', price: 0, is_closed: false }
            ]
        }));
    }, [activeDay]);

    /**
     * Elimina un bloque de horario específico por su índice
     */
    const handleRemoveTimeSlot = useCallback((index) => {
        setSchedules(prev => ({
            ...prev,
            [activeDay]: prev[activeDay].filter((_, i) => i !== index)
        }));
    }, [activeDay]);

    /**
     * Actualiza un campo específico (precio, hora, etc) de un bloque de horario
     */
    const handleUpdateField = useCallback((index, field, value) => {
        setSchedules(prev => {
            const daySchedules = [...prev[activeDay]];
            daySchedules[index] = { ...daySchedules[index], [field]: value };
            return { ...prev, [activeDay]: daySchedules };
        });
    }, [activeDay]);

    /**
     * Copia la configuración de horarios del día activo a otros días seleccionados
     */
    const handleCopySchedule = useCallback((targetDays) => {
        const sourceSchedule = schedules[activeDay];
        setSchedules(prev => {
            const newSchedules = { ...prev };
            targetDays.forEach(day => {
                newSchedules[day] = sourceSchedule.map(s => ({ ...s }));
            });
            return newSchedules;
        });
        setCopying(false);
        toast.success('Horarios copiados correctamente');
    }, [activeDay, schedules]);

    /**
     * Valida que no haya solapamiento de horarios en un día específico
     * @private
     */
    const validateNoOverlaps = useCallback((daySchedules, dayLabel) => {
        if (!daySchedules || daySchedules.length === 0) return true;

        const openingTime = spaceDetails?.sucursal?.opening_time;
        const closingTime = spaceDetails?.sucursal?.closing_time;

        // Ordenar por hora de inicio para facilitar la comparación
        const sorted = [...daySchedules].sort((a, b) => a.start_time.localeCompare(b.start_time));

        for (let i = 0; i < sorted.length; i++) {
            const current = sorted[i];

            // 1. Validar integridad del bloque (inicio < fin)
            if (current.start_time >= current.end_time) {
                toast.error(`En ${dayLabel}: El horario ${current.start_time}-${current.end_time} es inválido (inicio >= fin).`, { icon: '⚠️' });
                return false;
            }

            // 2. Validar contra el rango de la sucursal
            if (openingTime && current.start_time < openingTime.substring(0, 5)) {
                toast.error(`En ${dayLabel}: El horario ${current.start_time} es antes de la apertura (${openingTime.substring(0, 5)}) de la sucursal.`, { icon: '⚠️' });
                return false;
            }
            if (closingTime && current.end_time > closingTime.substring(0, 5)) {
                toast.error(`En ${dayLabel}: El horario ${current.end_time} es después del cierre (${closingTime.substring(0, 5)}) de la sucursal.`, { icon: '⚠️' });
                return false;
            }

            // 3. Validar solapamiento con el siguiente bloque (si existe)
            if (i < sorted.length - 1) {
                const next = sorted[i + 1];
                if (current.end_time > next.start_time) {
                    toast.error(`En ${dayLabel}: Los horarios se cruzan. El bloque ${current.start_time}-${current.end_time} se solapa con ${next.start_time}.`, { icon: '⚠️' });
                    return false;
                }
            }
        }

        return true;
    }, [spaceDetails]);

    /**
     * Prepara y aplana los horarios agrupados para enviarlos al servicio
     */
    const handlePrepareAndSaveSchedules = useCallback(() => {
        const flatSchedules = [];
        const days = Object.keys(schedules);

        for (const day of days) {
            const dayLabel = DAYS_OF_WEEK.find(d => d.value === day)?.label || day;
            
            // Validar solapamientos antes de aplanar
            if (!validateNoOverlaps(schedules[day], dayLabel)) {
                return; // Detener si hay error
            }

            schedules[day].forEach(slot => {
                flatSchedules.push({
                    day_of_week: day,
                    ...slot
                });
            });
        }

        if (flatSchedules.length === 0) {
            toast.error('Debes añadir al menos un horario antes de guardar.');
            return;
        }

        handleSaveSchedules(spaceId, flatSchedules);
    }, [schedules, spaceId, handleSaveSchedules, validateNoOverlaps]);

    // Inicializar horarios cuando se cargan los detalles del espacio o se pasan por props
    useEffect(() => {
        // Si se pasan horarios iniciales, los usamos
        if (initialSchedules) {
            setSchedules(groupSchedulesByDay(initialSchedules));
        }
    }, [initialSchedules, groupSchedulesByDay]);

    // Solo cargar detalles si no tenemos los datos iniciales
    useEffect(() => {
        if (spaceId && !initialSchedules) {
            getSpaceDetails(spaceId);
            getSpaceSchedules(spaceId);
        }
    }, [spaceId, getSpaceDetails, getSpaceSchedules, initialSchedules]);

    return {
        loading,
        loadingSchedules,
        error,
        spaceDetails,
        showSchedulesModal,
        setShowSchedulesModal,
        showMediaForm,
        setShowMediaForm,
        registerSpace,
        updateSpace,
        getSpaceDetails,
        getSpaceSchedules,
        createSchedules,
        toggleDayStatus,
        uploadMedia,
        handleDeleteMedia,
        handleSetPrimaryMedia,
        refreshDetails,
        handleSaveSchedules,
        handleToggleDayStatus,
        handleAddTimeSlot,
        handleRemoveTimeSlot,
        handleUpdateField,
        handleCopySchedule,
        handlePrepareAndSaveSchedules,
        formatDate,
        getStatusClass,
        getStatusText,
        schedules,
        setSchedules,
        activeDay,
        setActiveDay,
        copying,
        setCopying,
        groupSchedulesByDay
    };
};
