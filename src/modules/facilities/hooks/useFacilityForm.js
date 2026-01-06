import { useState } from 'react';
import { 
    validateRequired, 
    validateTextLength,
    validateFacilityForm 
} from '../utils/validation';

export const useFacilityForm = () => {
    const [formData, setFormData] = useState({
        company_id: '',
        name: '',
        description: '',
        address: '',
        features: '',
        status: 'Activo'
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'company_id':
                newErrors.company_id = validateRequired(value, 'Empresa');
                break;

            case 'name':
                newErrors.name = validateRequired(value, 'Nombre de la instalación');
                break;

            case 'description':
                newErrors.description = validateTextLength(value, 'Descripción', 10, 1000);
                break;

            case 'address':
                newErrors.address = validateRequired(value, 'Dirección');
                break;

            case 'features':
                newErrors.features = validateTextLength(value, 'Características', 5, 500);
                break;

            default:
                break;
        }

        // Remove empty errors
        Object.keys(newErrors).forEach(key => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        validateField(name, value);
    };

    const validateForm = () => {
        const requiredFields = ['company_id', 'name', 'description', 'address', 'features'];
        let isValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field, formData[field])) {
                isValid = false;
            }
        });

        return isValid;
    };

    const resetForm = () => {
        setFormData({
            company_id: '',
            name: '',
            description: '',
            address: '',
            features: '',
            status: 'Activo'
        });
        setErrors({});
    };

    const submitForm = async (onSubmit) => {
        if (!validateForm()) {
            return false;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            resetForm();
            return true;
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        errors,
        isLoading,
        handleChange,
        validateForm,
        resetForm,
        submitForm
    };
};