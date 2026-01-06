import { useState } from 'react';
import { 
    validateRequired, 
    validatePositiveNumber,
    validatePositiveInteger,
    validateTime,
    validateSpaceForm 
} from '../utils/validation';

export const useSpaceForm = () => {
    const [formData, setFormData] = useState({
        sport_facility_id: '',
        surface_type_id: '',
        name: '',
        capacity: '',
        dimensions: '',
        equipment: '',
        characteristics: '',
        hourly_rate: '',
        weekend_rate: '',
        peak_hour_rate: '',
        minimum_booking_hour: '1',
        maximum_booking_hour: '8',
        booking_buffer_minutes: '15',
        status: 'Disponible'
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'sport_facility_id':
                newErrors.sport_facility_id = validateRequired(value, 'Instalación deportiva');
                break;

            case 'surface_type_id':
                newErrors.surface_type_id = validateRequired(value, 'Tipo de superficie');
                break;

            case 'name':
                newErrors.name = validateRequired(value, 'Nombre del espacio');
                break;

            case 'capacity':
                newErrors.capacity = validatePositiveInteger(value, 'Capacidad');
                break;

            case 'dimensions':
                newErrors.dimensions = validateRequired(value, 'Dimensiones');
                break;

            case 'hourly_rate':
                newErrors.hourly_rate = validatePositiveNumber(value, 'Tarifa por hora');
                break;

            case 'weekend_rate':
                newErrors.weekend_rate = validatePositiveNumber(value, 'Tarifa de fin de semana');
                break;

            case 'peak_hour_rate':
                newErrors.peak_hour_rate = validatePositiveNumber(value, 'Tarifa de hora punta');
                break;

            case 'minimum_booking_hour':
                newErrors.minimum_booking_hour = validatePositiveInteger(value, 'Horas mínimas de reserva');
                break;

            case 'maximum_booking_hour':
                newErrors.maximum_booking_hour = validatePositiveInteger(value, 'Horas máximas de reserva');
                if (!newErrors.maximum_booking_hour && parseInt(value) < parseInt(formData.minimum_booking_hour)) {
                    newErrors.maximum_booking_hour = 'Debe ser mayor a las horas mínimas';
                }
                break;

            case 'booking_buffer_minutes':
                if (!value) {
                    newErrors.booking_buffer_minutes = 'Los minutos de buffer son requeridos';
                } else if (isNaN(value) || parseInt(value) < 0) {
                    newErrors.booking_buffer_minutes = 'Debe ser un número válido (0 o mayor)';
                } else {
                    delete newErrors.booking_buffer_minutes;
                }
                break;

            case 'equipment':
                newErrors.equipment = validateRequired(value, 'Equipamiento');
                break;

            case 'characteristics':
                newErrors.characteristics = validateRequired(value, 'Características');
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
        const requiredFields = [
            'sport_facility_id', 'surface_type_id', 'name', 'capacity', 'dimensions',
            'equipment', 'characteristics', 'hourly_rate', 'weekend_rate', 'peak_hour_rate',
            'minimum_booking_hour', 'maximum_booking_hour', 'booking_buffer_minutes'
        ];
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
            sport_facility_id: '',
            surface_type_id: '',
            name: '',
            capacity: '',
            dimensions: '',
            equipment: '',
            characteristics: '',
            hourly_rate: '',
            weekend_rate: '',
            peak_hour_rate: '',
            minimum_booking_hour: '1',
            maximum_booking_hour: '8',
            booking_buffer_minutes: '15',
            status: 'Disponible'
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