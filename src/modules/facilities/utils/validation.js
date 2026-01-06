// Validation utilities for forms

// Email validation
export const validateEmail = (email) => {
    if (!email) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return '';
};

// Phone validation - Actualizado para coincidir con el backend
export const validatePhone = (phone) => {
    if (!phone) return 'El teléfono es requerido';
    // Patrón del backend: /^[+]?[0-9\s\-()]{7,20}$/ para teléfono fijo
    // Patrón del backend: /^[+]?[0-9\s\-()]{9,20}$/ para celular
    const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
        return 'El teléfono debe tener entre 7 y 20 caracteres y solo contener números, espacios, guiones y paréntesis';
    }
    return '';
};

// URL validation
export const validateUrl = (url) => {
    if (!url) return '';
    try {
        new URL(url);
        return '';
    } catch {
        return 'Formato de URL inválido';
    }
};

// Required field validation
export const validateRequired = (value, fieldName) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} es requerido`;
    }
    return '';
};

// Number validation
export const validateNumber = (value, fieldName, min = null, max = null) => {
    if (!value) return `${fieldName} es requerido`;

    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} debe ser un número válido`;

    if (min !== null && num < min) {
        return `${fieldName} debe ser mayor o igual a ${min}`;
    }

    if (max !== null && num > max) {
        return `${fieldName} debe ser menor o igual a ${max}`;
    }

    return '';
};

// Positive number validation
export const validatePositiveNumber = (value, fieldName) => {
    return validateNumber(value, fieldName, 0.01);
};

// Integer validation
export const validateInteger = (value, fieldName, min = null, max = null) => {
    if (!value) return `${fieldName} es requerido`;

    const num = parseInt(value);
    if (isNaN(num) || !Number.isInteger(num)) {
        return `${fieldName} debe ser un número entero`;
    }

    if (min !== null && num < min) {
        return `${fieldName} debe ser mayor o igual a ${min}`;
    }

    if (max !== null && num > max) {
        return `${fieldName} debe ser menor o igual a ${max}`;
    }

    return '';
};

// Positive integer validation
export const validatePositiveInteger = (value, fieldName) => {
    return validateInteger(value, fieldName, 1);
};

// Time validation (HH:MM format)
export const validateTime = (time, fieldName) => {
    if (!time) return `${fieldName} es requerido`;

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
        return `${fieldName} debe tener formato HH:MM (24 horas)`;
    }

    return '';
};

// Time range validation
export const validateTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '';

    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    if (start >= end) {
        return 'La hora de inicio debe ser anterior a la hora de fin';
    }

    return '';
};

// Coordinates validation - Returns object with both errors
export const validateCoordinates = (lat, lng) => {
    const errors = {};

    if (lat !== '' && lat !== null && lat !== undefined) {
        const latitude = parseFloat(lat);
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            errors.latitude = 'La latitud debe estar entre -90 y 90';
        }
    }

    if (lng !== '' && lng !== null && lng !== undefined) {
        const longitude = parseFloat(lng);
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            errors.longitude = 'La longitud debe estar entre -180 y 180';
        }
    }

    return errors;
};

// Individual coordinate validation - Returns string error for single field
export const validateSingleCoordinate = (value, fieldName) => {
    if (!value || value === '') return '';
    
    const coordinate = parseFloat(value);
    if (isNaN(coordinate)) {
        return `${fieldName === 'latitude' ? 'La latitud' : 'La longitud'} debe ser un número válido`;
    }

    if (fieldName === 'latitude') {
        if (coordinate < -90 || coordinate > 90) {
            return 'La latitud debe estar entre -90 y 90';
        }
    } else if (fieldName === 'longitude') {
        if (coordinate < -180 || coordinate > 180) {
            return 'La longitud debe estar entre -180 y 180';
        }
    }

    return '';
};

// Document number validation - Actualizado para coincidir con el backend
export const validateDocument = (document, type = 'general') => {
    if (!document) return 'El número de documento es requerido';

    // Patrón del backend: /^[0-9A-Z\-]{8,20}$/
    const documentRegex = /^[0-9A-Z\-]{8,20}$/;

    if (!documentRegex.test(document.toUpperCase())) {
        return 'El documento debe tener entre 8 y 20 caracteres alfanuméricos (números, letras mayúsculas y guiones)';
    }

    return '';
};

// Postal code validation
export const validatePostalCode = (code) => {
    if (!code) return '';

    // Basic validation for Colombian postal codes
    if (!/^\d{6}$/.test(code)) {
        return 'El código postal debe tener 6 dígitos';
    }

    return '';
};

// Text length validation
export const validateTextLength = (text, fieldName, minLength = 0, maxLength = null) => {
    if (!text) {
        if (minLength > 0) return `${fieldName} es requerido`;
        return '';
    }

    if (text.length < minLength) {
        return `${fieldName} debe tener al menos ${minLength} caracteres`;
    }

    if (maxLength && text.length > maxLength) {
        return `${fieldName} no puede exceder ${maxLength} caracteres`;
    }

    return '';
};

// Array validation
export const validateArray = (array, fieldName, minItems = 0) => {
    if (!Array.isArray(array) || array.length < minItems) {
        return `Debe seleccionar al menos ${minItems} ${fieldName.toLowerCase()}`;
    }
    return '';
};

// Company form validation
export const validateCompanyForm = (formData) => {
    const errors = {};

    // Required fields
    errors.name = validateRequired(formData.name, 'Nombre de la empresa');
    errors.business_owner = validateRequired(formData.business_owner, 'Propietario');
    errors.country = validateRequired(formData.country, 'País');
    errors.document_type = validateRequired(formData.document_type, 'Tipo de documento');
    errors.document_number = validateDocument(formData.document_number, formData.document_type);
    errors.phone = validatePhone(formData.phone);
    errors.email = validateEmail(formData.email);
    errors.address = validateRequired(formData.address, 'Dirección');
    errors.city = validateRequired(formData.city, 'Ciudad');

    // Optional fields with validation
    if (formData.website) {
        errors.website = validateUrl(formData.website);
    }

    if (formData.postal_code) {
        errors.postal_code = validatePostalCode(formData.postal_code);
    }

    // Coordinates validation
    const coordErrors = validateCoordinates(formData.latitude, formData.longitude);
    if (coordErrors.latitude) errors.latitude = coordErrors.latitude;
    if (coordErrors.longitude) errors.longitude = coordErrors.longitude;

    // Text length validation
    if (formData.description) {
        errors.description = validateTextLength(formData.description, 'Descripción', 0, 500);
    }

    // Remove empty errors
    Object.keys(errors).forEach(key => {
        if (!errors[key]) delete errors[key];
    });

    return errors;
};

// Facility form validation
export const validateFacilityForm = (formData) => {
    const errors = {};

    // Required fields
    errors.company_id = validateRequired(formData.company_id, 'Empresa');
    errors.name = validateRequired(formData.name, 'Nombre de la instalación');
    errors.address = validateRequired(formData.address, 'Dirección');
    errors.city = validateRequired(formData.city, 'Ciudad');
    errors.status = validateRequired(formData.status, 'Estado');

    // Optional fields with validation
    if (formData.phone) {
        errors.phone = validatePhone(formData.phone);
    }

    if (formData.email) {
        errors.email = validateEmail(formData.email);
    }

    if (formData.website) {
        errors.website = validateUrl(formData.website);
    }

    if (formData.postal_code) {
        errors.postal_code = validatePostalCode(formData.postal_code);
    }

    // Coordinates validation
    const coordErrors = validateCoordinates(formData.latitude, formData.longitude);
    if (coordErrors.latitude) errors.latitude = coordErrors.latitude;
    if (coordErrors.longitude) errors.longitude = coordErrors.longitude;

    // Time validation
    if (formData.opening_time) {
        errors.opening_time = validateTime(formData.opening_time, 'Hora de apertura');
    }

    if (formData.closing_time) {
        errors.closing_time = validateTime(formData.closing_time, 'Hora de cierre');
    }

    // Time range validation
    if (formData.opening_time && formData.closing_time) {
        const timeRangeError = validateTimeRange(formData.opening_time, formData.closing_time);
        if (timeRangeError) {
            errors.closing_time = timeRangeError;
        }
    }

    // Number validation
    if (formData.total_capacity) {
        errors.total_capacity = validatePositiveInteger(formData.total_capacity, 'Capacidad total');
    }

    if (formData.sports_spaces_count) {
        errors.sports_spaces_count = validatePositiveInteger(formData.sports_spaces_count, 'Número de espacios');
    }

    // Text length validation
    if (formData.description) {
        errors.description = validateTextLength(formData.description, 'Descripción', 0, 1000);
    }

    // Remove empty errors
    Object.keys(errors).forEach(key => {
        if (!errors[key]) delete errors[key];
    });

    return errors;
};

// Space form validation
export const validateSpaceForm = (formData) => {
    const errors = {};

    // Required fields
    errors.sport_facility_id = validateRequired(formData.sport_facility_id, 'Instalación');
    errors.surface_type_id = validateRequired(formData.surface_type_id, 'Tipo de superficie');
    errors.name = validateRequired(formData.name, 'Nombre del espacio');
    errors.capacity = validatePositiveInteger(formData.capacity, 'Capacidad');
    errors.status = validateRequired(formData.status, 'Estado');

    // Dimensions validation
    if (formData.length) {
        errors.length = validatePositiveNumber(formData.length, 'Largo');
    }

    if (formData.width) {
        errors.width = validatePositiveNumber(formData.width, 'Ancho');
    }

    // Pricing validation
    errors.hourly_rate_weekday = validatePositiveNumber(formData.hourly_rate_weekday, 'Tarifa entre semana');
    errors.hourly_rate_weekend = validatePositiveNumber(formData.hourly_rate_weekend, 'Tarifa fin de semana');

    if (formData.hourly_rate_night) {
        errors.hourly_rate_night = validatePositiveNumber(formData.hourly_rate_night, 'Tarifa nocturna');
    }

    if (formData.hourly_rate_holiday) {
        errors.hourly_rate_holiday = validatePositiveNumber(formData.hourly_rate_holiday, 'Tarifa festivos');
    }

    if (formData.deposit_amount) {
        errors.deposit_amount = validatePositiveNumber(formData.deposit_amount, 'Depósito');
    }

    if (formData.bulk_discount_percentage && formData.bulk_discount_percentage > 0) {
        errors.bulk_discount_percentage = validateNumber(formData.bulk_discount_percentage, 'Descuento por volumen', 0, 100);
    }

    // Time validation
    if (formData.booking_start_time) {
        errors.booking_start_time = validateTime(formData.booking_start_time, 'Hora inicio reservas');
    }

    if (formData.booking_end_time) {
        errors.booking_end_time = validateTime(formData.booking_end_time, 'Hora fin reservas');
    }

    // Time range validation
    if (formData.booking_start_time && formData.booking_end_time) {
        const timeRangeError = validateTimeRange(formData.booking_start_time, formData.booking_end_time);
        if (timeRangeError) {
            errors.booking_end_time = timeRangeError;
        }
    }

    // Duration validation
    if (formData.min_booking_duration) {
        errors.min_booking_duration = validatePositiveInteger(formData.min_booking_duration, 'Duración mínima');
    }

    if (formData.max_booking_duration) {
        errors.max_booking_duration = validatePositiveInteger(formData.max_booking_duration, 'Duración máxima');
    }

    // Buffer time validation
    if (formData.buffer_time_before) {
        errors.buffer_time_before = validateInteger(formData.buffer_time_before, 'Tiempo buffer antes', 0);
    }

    if (formData.buffer_time_after) {
        errors.buffer_time_after = validateInteger(formData.buffer_time_after, 'Tiempo buffer después', 0);
    }

    // Advance booking validation
    if (formData.advance_booking_days) {
        errors.advance_booking_days = validatePositiveInteger(formData.advance_booking_days, 'Días anticipación');
    }

    if (formData.cancellation_hours) {
        errors.cancellation_hours = validatePositiveInteger(formData.cancellation_hours, 'Horas cancelación');
    }

    // Text length validation
    if (formData.description) {
        errors.description = validateTextLength(formData.description, 'Descripción', 0, 500);
    }

    if (formData.dimensions) {
        errors.dimensions = validateTextLength(formData.dimensions, 'Dimensiones', 0, 100);
    }

    if (formData.characteristics) {
        errors.characteristics = validateTextLength(formData.characteristics, 'Características', 0, 500);
    }

    if (formData.additional_equipment) {
        errors.additional_equipment = validateTextLength(formData.additional_equipment, 'Equipamiento adicional', 0, 300);
    }

    // Remove empty errors
    Object.keys(errors).forEach(key => {
        if (!errors[key]) delete errors[key];
    });

    return errors;
};

// General form validation helper
export const hasErrors = (errors) => {
    return Object.keys(errors).length > 0;
};

// Get first error message
export const getFirstError = (errors) => {
    const keys = Object.keys(errors);
    return keys.length > 0 ? errors[keys[0]] : '';
};

// Format validation errors for display
export const formatErrors = (errors) => {
    return Object.entries(errors).map(([field, message]) => ({
        field,
        message
    }));
};
