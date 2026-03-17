import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useCompanyList } from './useCompanyList';
import toast from 'react-hot-toast';
import { handleAxiosError } from '../../../shared/utils/errorHandler';

const mapInitialData = (data) => ({
    name: data?.name || '',
    address: data?.address || '',
    ubigeo_code: data?.ubigeo_code || '',
    phone_cell: data?.phone_cell || '',
    phone: data?.phone || '',
    website: data?.website || '',
    document: data?.document || '',
    postal_code: data?.postal_code || '',
    latitude: data?.latitude ?? '',
    longitude: data?.longitude ?? '',
    description: data?.description || '',
    parking_available: Boolean(data?.parking_available),
    country_id: data?.country_id || 1,
    parent_company_id: data?.parent_company_id ?? '',
    opening_time: data?.opening_time || '',
    closing_time: data?.closing_time || '',
    min_price: data?.min_price || '',
    features: Array.isArray(data?.features) ? data.features.join(', ') : (data?.features || ''),
    main_image: null
});

export const useCompanyForm = (initialData = null) => {
    const [formData, setFormData] = useState(mapInitialData(initialData));
    const [previews, setPreviews] = useState({
        main_image: null
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const { loading, error, success, registerCompany, updateCompany, clearMessages } = useCompanyList({ autoLoad: false });
    const lastInitialIdRef = useRef(initialData?.company_id ?? initialData?.id ?? null);

    useEffect(() => {
        const nextId = initialData?.company_id ?? initialData?.id ?? null;
        if (!initialData || !nextId) return;
        if (lastInitialIdRef.current === nextId) return;
        lastInitialIdRef.current = nextId;

        setFormData(mapInitialData(initialData));
    }, [initialData]);

    // Validaciones simplificadas
    const validateField = useCallback((name, value) => {
        const validations = {
            country_id: () => {
                if (!value) return 'País es requerido';
                const n = parseInt(value, 10);
                if (!Number.isFinite(n) || n <= 0) return 'País inválido';
                return '';
            },
            name: () => {
                if (!value) return 'Nombre es requerido';
                if (value.length < 2) return 'Debe tener al menos 2 caracteres';
                if (value.length > 200) return 'Debe tener máximo 200 caracteres';
                return '';
            },
            address: () => {
                if (!value) return 'Dirección es requerida';
                if (value.length < 10) return 'Debe tener al menos 10 caracteres';
                return '';
            },
            ubigeo_code: () => {
                if (!value) return 'Código ubigeo es requerido';
                if (!/^[0-9]{6}$/.test(value)) return 'Debe tener 6 dígitos';
                return '';
            },
            phone_cell: () => {
                if (!value) return 'Teléfono celular es requerido';
                if (!/^[+]?[0-9\s\-()]{9,20}$/.test(value)) return 'Formato inválido (9-20 caracteres)';
                return '';
            },
            phone: () => {
                if (!value) return 'Teléfono fijo es requerido';
                if (!/^[+]?[0-9\s\-()]{7,20}$/.test(value)) return 'Formato inválido (7-20 caracteres)';
                return '';
            },
            document: () => {
                if (!value) return 'Documento es requerido';
                if (!/^[0-9A-Z\-]{8,20}$/.test(value.toUpperCase())) return 'Formato inválido (8-20 caracteres)';
                return '';
            },
            website: () => {
                if (value && !/^https?:\/\/.+/.test(value.trim())) return 'URL inválida';
                return '';
            },
            latitude: () => {
                if (value && (isNaN(value) || value < -90 || value > 90)) return 'Latitud inválida';
                return '';
            },
            longitude: () => {
                if (value && (isNaN(value) || value < -180 || value > 180)) return 'Longitud inválida';
                return '';
            }
        };

        return validations[name] ? validations[name]() : '';
    }, []);

    // Manejar cambios en campos
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: fieldValue }));
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateField(name, fieldValue);
        setErrors(prev => ({ ...prev, [name]: error }));

        if (error || success) clearMessages();
    }, [validateField, success, clearMessages]);

    // Manejar cambios en archivos
    const handleFileChange = useCallback((e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            setFormData(prev => ({ ...prev, [name]: file }));
            setTouched(prev => ({ ...prev, [name]: true }));

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [name]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleBlur = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateField(name, fieldValue);
        setErrors(prev => ({ ...prev, [name]: error }));

        if (error || success) clearMessages();
    }, [validateField, success, clearMessages]);

    // Validar todos los campos
    const validateAll = useCallback(() => {
        const newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, field) => ({ ...acc, [field]: true }), {}));

        return Object.keys(newErrors).length === 0;
    }, [formData, validateField]);

    // Verificar si el formulario es válido
    const isValid = useMemo(() => {
        const hasErrors = Object.values(errors).some(error => error);
        const requiredFields = ['name', 'address', 'ubigeo_code', 'phone_cell', 'phone', 'document'];
        const hasRequiredFields = requiredFields.every(field => formData[field]) && Boolean(formData.country_id);

        return !hasErrors && hasRequiredFields;
    }, [errors, formData]);

    // Resetear formulario
    const resetForm = useCallback(() => {
        setFormData({
            name: '', address: '', ubigeo_code: '', phone_cell: '', phone: '',
            website: '', document: '', postal_code: '', latitude: '', longitude: '',
            description: '', parking_available: false, country_id: 1,
            parent_company_id: '',
            opening_time: '', closing_time: '', min_price: '', features: '',
            main_image: null
        });
        setPreviews({
            main_image: null
        });
        setErrors({});
        setTouched({});
        clearMessages();
    }, [clearMessages]);

    const isSubsidiary = useMemo(() => {
        return initialData?.parent_company_id !== null && initialData?.parent_company_id !== undefined && initialData?.parent_company_id !== '';
    }, [initialData]);

    // Enviar formulario
    const handleSubmit = useCallback(async () => {
        if (!validateAll()) {
            toast.error('Corrige los errores en el formulario');
            return { success: false, error: 'Errores en el formulario' };
        }

        const companyId = initialData?.company_id ?? initialData?.id;
        const isEditing = Boolean(companyId);

        // Usar FormData para enviar archivos
        const submitData = new FormData();

        // Agregar campos básicos
        submitData.append('country_id', parseInt(formData.country_id) || 0);
        submitData.append('name', formData.name);
        submitData.append('address', formData.address);
        submitData.append('ubigeo_code', formData.ubigeo_code);
        submitData.append('phone_cell', formData.phone_cell);
        submitData.append('phone', formData.phone);
        submitData.append('document', formData.document);
        submitData.append('parking_available', Boolean(formData.parking_available));

        // Campos opcionales
        if (formData.website?.trim()) submitData.append('website', formData.website.trim());
        if (formData.postal_code) submitData.append('postal_code', formData.postal_code);
        if (formData.latitude) submitData.append('latitude', parseFloat(formData.latitude));
        if (formData.longitude) submitData.append('longitude', parseFloat(formData.longitude));
        if (formData.description) submitData.append('description', formData.description);

        // Parent Company ID - Solo se envía en creación
        if (!isEditing && formData.parent_company_id !== null && formData.parent_company_id !== undefined) {
            const parentId = String(formData.parent_company_id || '').trim();
            if (parentId) {
                submitData.append('parent_company_id', parseInt(parentId, 10));
            }
        }

        // Horarios y precios
        if (formData.opening_time) submitData.append('opening_time', formData.opening_time);
        if (formData.closing_time) submitData.append('closing_time', formData.closing_time);
        if (formData.min_price) submitData.append('min_price', parseFloat(formData.min_price));
        if (formData.features) submitData.append('features', formData.features);

        // Archivos
        if (formData.main_image) {
            submitData.append('main_image', formData.main_image);
        }

        try {
            const result = isEditing
                ? await updateCompany(companyId, submitData)
                : await registerCompany(submitData);

            // Asegurarse de que result no sea undefined
            if (result) {
                toast.success(result.message || (isEditing ? 'Empresa actualizada exitosamente' : 'Empresa registrada exitosamente'));
            } else {
                toast.success(isEditing ? 'Empresa actualizada exitosamente' : 'Empresa registrada exitosamente');
            }
            resetForm();
            return { success: true, data: result };
        } catch (error) {
            const errorMessage = handleAxiosError(error);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [formData, initialData, validateAll, updateCompany, registerCompany, resetForm, isSubsidiary]);

    return {
        formData,
        errors,
        touched,
        loading,
        isLoading: loading,
        isValid,
        successMessage: success,
        errorMessage: error,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        clearMessages,
        setFormData,
        setErrors,
        previews,
        handleFileChange
    };
};
