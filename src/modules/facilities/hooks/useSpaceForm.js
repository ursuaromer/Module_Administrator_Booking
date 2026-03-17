import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSpace } from './useSpace';

const mapInitialData = (data) => ({
    name: data?.name || '',
    description: data?.description || '',
    company_id: data?.company_id || '',
    sucursal_id: data?.sucursal_id || '',
    surface_type_id: data?.surface?.id || data?.surface_type_id || '',
    sport_type_id: data?.sport?.id || data?.sport_type_id || '',
    sport_category_id: data?.category?.id || data?.sport_category_id || '',
    status_space: data?.status || data?.status_space || 'ACTIVE',
    capacity: data?.capacity || '',
    dimensions: data?.dimensions || '',
    equipment: data?.equipment ? (Array.isArray(data.equipment) ? data.equipment.join(', ') : data.equipment) : '',
    minimum_booking_minutes: data?.booking_rules?.min_minutes || data?.minimum_booking_minutes || 60,
    maximum_booking_minutes: data?.booking_rules?.max_minutes || data?.maximum_booking_minutes || 480,
    booking_buffer_minutes: data?.booking_rules?.buffer_minutes || data?.booking_buffer_minutes || 15
});

export const useSpaceForm = (initialData = null) => {
    const [formData, setFormData] = useState(mapInitialData(initialData));
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const { loading, registerSpace, updateSpace } = useSpace();

    useEffect(() => {
        if (initialData) {
            setFormData(mapInitialData(initialData));
        }
    }, [initialData]);

    const validateField = useCallback((name, value) => {
        const validations = {
            name: () => {
                if (!value) return 'Nombre es requerido';
                if (value.length < 2) return 'Mínimo 2 caracteres';
                if (value.length > 200) return 'Máximo 200 caracteres';
                return '';
            },
            description: () => (value && value.length > 1000) ? 'Máximo 1000 caracteres' : '',
            dimensions: () => {
                if (!value) return 'Dimensiones son requeridas';
                if (value.length > 100) return 'Máximo 100 caracteres';
                return '';
            },
            equipment: () => (value && value.length > 1000) ? 'Máximo 1000 caracteres' : '',
            capacity: () => {
                if (!value && value !== 0) return 'Capacidad es requerida';
                const n = parseInt(value, 10);
                return (isNaN(n) || n <= 0) ? 'Debe ser un número positivo' : '';
            },
            minimum_booking_minutes: () => {
                if (!value && value !== 0) return 'Requerido';
                const n = parseInt(value, 10);
                return (isNaN(n) || n <= 0) ? 'Debe ser mayor a 0' : '';
            },
            maximum_booking_minutes: () => {
                if (!value && value !== 0) return 'Requerido';
                const n = parseInt(value, 10);
                if (isNaN(n) || n <= 0) return 'Debe ser mayor a 0';
                return n > 1440 ? 'Máximo 24 horas (1440 min)' : '';
            },
            booking_buffer_minutes: () => {
                if (!value && value !== 0) return 'Requerido';
                const n = parseInt(value, 10);
                return (isNaN(n) || n < 0) ? 'No puede ser negativo' : '';
            },
            sport_type_id: () => !value ? 'Deporte es requerido' : '',
            surface_type_id: () => !value ? 'Superficie es requerida' : '',
            sport_category_id: () => !value ? 'Categoría es requerida' : '',
            status_space: () => !value ? 'Estado es requerido' : ''
        };

        return validations[name] ? validations[name]() : '';
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({ ...prev, [name]: val }));
        setTouched(prev => ({ ...prev, [name]: true }));
        
        const error = validateField(name, val);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [validateField]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [validateField]);

    const isValid = useMemo(() => {
        const requiredFields = [
            'name', 'dimensions', 'capacity', 'sport_type_id', 
            'surface_type_id', 'sport_category_id'
        ];
        
        const hasErrors = Object.values(errors).some(error => error);
        const hasAllRequired = requiredFields.every(field => formData[field]);
        
        return !hasErrors && hasAllRequired;
    }, [errors, formData]);

    const handleSubmit = async (e, overrides = {}) => {
        if (e) e.preventDefault();
        
        const { companyId, sucursalId } = overrides;
        
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            return null;
        }

        const submitData = {
            ...formData,
            company_id: companyId || formData.company_id,
            sucursal_id: sucursalId || formData.sucursal_id,
            capacity: parseInt(formData.capacity, 10),
            minimum_booking_minutes: parseInt(formData.minimum_booking_minutes, 10),
            maximum_booking_minutes: parseInt(formData.maximum_booking_minutes, 10),
            booking_buffer_minutes: parseInt(formData.booking_buffer_minutes, 10),
            sport_type_id: parseInt(formData.sport_type_id, 10),
            surface_type_id: parseInt(formData.surface_type_id, 10),
            sport_category_id: parseInt(formData.sport_category_id, 10)
        };

        try {
            const result = initialData 
                ? await updateSpace(initialData.id || initialData.space_id, submitData)
                : await registerSpace(submitData);
            return result;
        } catch (err) {
            return null;
        }
    };

    return {
        formData,
        errors,
        touched,
        loading,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit
    };
};
