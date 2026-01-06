import { useState, useMemo, useCallback } from 'react';
import { useCompany } from './useCompany';
import toast from 'react-hot-toast';

export const useCompanyForm = (initialData = null) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        address: initialData?.address || '',
        ubigeo_code: initialData?.ubigeo_code || '',
        phone_cell: initialData?.phone_cell || '',
        phone: initialData?.phone || '',
        website: initialData?.website || '',
        document: initialData?.document || '',
        postal_code: initialData?.postal_code || '',
        latitude: initialData?.latitude || '',
        longitude: initialData?.longitude || '',
        description: initialData?.description || '',
        parking_available: initialData?.parking_available || false,
        country_id: initialData?.country_id || 1,
        parent_company_id: initialData?.parent_company_id || '',
        belongs_to_company: initialData?.belongs_to_company || false
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const { loading, error, success, registerCompany, clearMessages } = useCompany({ autoLoad: false });

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

        setFormData(prev => {
            if (name === 'belongs_to_company' && fieldValue === false) {
                return { ...prev, [name]: fieldValue, parent_company_id: '' };
            }
            return { ...prev, [name]: fieldValue };
        });
        setTouched(prev => ({ ...prev, [name]: true }));
        
        const error = validateField(name, fieldValue);
        setErrors(prev => ({ ...prev, [name]: error }));
        
        if (error || success) clearMessages();
    }, [validateField, success, clearMessages]);

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

        if (formData.belongs_to_company && !formData.parent_company_id) {
            newErrors.parent_company_id = 'Selecciona una compañía padre';
        }

        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
        
        return Object.keys(newErrors).length === 0;
    }, [formData, validateField]);

    // Verificar si el formulario es válido
    const isValid = useMemo(() => {
        const hasErrors = Object.values(errors).some(error => error);
        const requiredFields = ['name', 'address', 'ubigeo_code', 'phone_cell', 'phone', 'document'];
        const hasRequiredFields = requiredFields.every(field => formData[field]) && Boolean(formData.country_id);
        const hasCompanyParent = !formData.belongs_to_company || Boolean(formData.parent_company_id);
        
        return !hasErrors && hasRequiredFields && hasCompanyParent;
    }, [errors, formData]);

    // Resetear formulario
    const resetForm = useCallback(() => {
        setFormData({
            name: '', address: '', ubigeo_code: '', phone_cell: '', phone: '',
            website: '', document: '', postal_code: '', latitude: '', longitude: '',
            description: '', parking_available: false, country_id: 1,
            parent_company_id: '', belongs_to_company: false
        });
        setErrors({});
        setTouched({});
        clearMessages();
    }, [clearMessages]);

    // Enviar formulario
    const handleSubmit = useCallback(async () => {
        if (!validateAll()) {
            toast.error('Corrige los errores en el formulario');
            return { success: false, error: 'Errores en el formulario' };
        }

        const submitData = {
            country_id: parseInt(formData.country_id) || 0,
            name: formData.name,
            address: formData.address,
            ubigeo_code: formData.ubigeo_code,
            phone_cell: formData.phone_cell,
            phone: formData.phone,
            document: formData.document,
            website: formData.website?.trim() || undefined,
            postal_code: formData.postal_code || undefined,
            latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
            longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
            description: formData.description || undefined,
            parking_available: Boolean(formData.parking_available),
            parent_company_id: formData.parent_company_id ? parseInt(formData.parent_company_id) : undefined
        };

        // Remover campos vacíos opcionales
        ['website', 'postal_code', 'description', 'latitude', 'longitude', 'parent_company_id']
            .forEach(key => {
                if (!submitData[key]) delete submitData[key];
            });

        const result = await registerCompany(submitData);
        if (result?.success) {
            toast.success(result.message || 'Empresa registrada exitosamente');
            resetForm();
            return result;
        }

        toast.error(result?.error?.message || 'Error al registrar empresa');
        return result || { success: false, error: { message: 'Error al registrar empresa' } };
    }, [formData, validateAll, registerCompany, resetForm]);

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
        setErrors
    };
};
