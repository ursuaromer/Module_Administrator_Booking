import React, { useState, useEffect } from 'react';
import { useFacilityForm } from '../hooks/useFacilityForm';
import {
    InputField,
    SelectField,
    TextAreaField,
    FormSection,
    FormRow,
    SubmitButton,
    CancelButton,
    FormActions,
    ErrorSummary
} from './FormComponents';

const FacilityRegistrationForm = ({
    onSubmit,
    onCancel,
    initialData = null,
    companies = []
}) => {
    const {
        formData,
        errors,
        isLoading,
        isValid,
        handleChange,
        handleSubmit,
        resetForm,
    } = useFacilityForm(initialData);

    // Status options
    const statusOptions = [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'maintenance', label: 'En Mantenimiento' },
        { value: 'construction', label: 'En Construcción' }
    ];

    // Company options (converted from props)
    const companyOptions = companies.map(company => ({
        value: company.id,
        label: company.name
    }));

    // Features options (common facility features)
    const availableFeatures = [
        'Estacionamiento',
        'Vestuarios',
        'Duchas',
        'Cafetería',
        'Tienda deportiva',
        'Primeros auxilios',
        'WiFi gratuito',
        'Aire acondicionado',
        'Calefacción',
        'Iluminación LED',
        'Sistema de sonido',
        'Cámaras de seguridad',
        'Acceso para discapacitados',
        'Zona de espectadores',
        'Área de descanso'
    ];

    const [selectedFeatures, setSelectedFeatures] = useState([]);

    useEffect(() => {
        if (formData.features) {
            try {
                const features = typeof formData.features === 'string'
                    ? JSON.parse(formData.features)
                    : formData.features;
                setSelectedFeatures(Array.isArray(features) ? features : []);
            } catch (error) {
                setSelectedFeatures([]);
            }
        }
    }, [formData.features]);

    const handleFeatureToggle = (feature) => {
        const updatedFeatures = selectedFeatures.includes(feature)
            ? selectedFeatures.filter(f => f !== feature)
            : [...selectedFeatures, feature];

        setSelectedFeatures(updatedFeatures);
        handleChange('features', JSON.stringify(updatedFeatures));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const result = await handleSubmit();
        if (result.success && onSubmit) {
            onSubmit(result.data);
        }
    };

    const handleCancel = () => {
        resetForm();
        setSelectedFeatures([]);
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="facility-registration-form">
            <div className="form-header">
                <h2>{initialData ? 'Editar Instalación Deportiva' : 'Registrar Nueva Instalación Deportiva'}</h2>
                <p>Complete la información de la instalación deportiva</p>
            </div>

            <form onSubmit={handleFormSubmit} className="registration-form">
                <ErrorSummary errors={errors} />

                {/* Basic Facility Information */}
                <FormSection title="Información Básica de la Instalación">
                    <SelectField
                        label="Empresa Propietaria"
                        name="company_id"
                        value={formData.company_id}
                        onChange={handleChange}
                        options={companyOptions}
                        error={errors.company_id}
                        placeholder="Seleccionar empresa..."
                        required
                    />

                    <FormRow>
                        <InputField
                            label="Nombre de la Instalación"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Ej: Complejo Deportivo Central"
                            required
                        />
                        <SelectField
                            label="Estado"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            options={statusOptions}
                            error={errors.status}
                            required
                        />
                    </FormRow>

                    <TextAreaField
                        label="Descripción"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        error={errors.description}
                        placeholder="Descripción detallada de la instalación deportiva"
                        rows={4}
                    />
                </FormSection>

                {/* Address Information */}
                <FormSection title="Información de Ubicación">
                    <TextAreaField
                        label="Dirección Completa"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                        placeholder="Dirección completa de la instalación"
                        required
                        rows={3}
                    />

                    <FormRow>
                        <InputField
                            label="Ciudad"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            error={errors.city}
                            placeholder="Ciudad donde se ubica la instalación"
                            required
                        />
                        <InputField
                            label="Código Postal"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            error={errors.postal_code}
                            placeholder="Código postal"
                        />
                    </FormRow>

                    <FormRow>
                        <InputField
                            label="Latitud"
                            name="latitude"
                            type="number"
                            step="any"
                            value={formData.latitude}
                            onChange={handleChange}
                            error={errors.latitude}
                            placeholder="Ej: 4.6097100"
                        />
                        <InputField
                            label="Longitud"
                            name="longitude"
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={handleChange}
                            error={errors.longitude}
                            placeholder="Ej: -74.0817500"
                        />
                    </FormRow>
                </FormSection>

                {/* Contact Information */}
                <FormSection title="Información de Contacto">
                    <FormRow>
                        <InputField
                            label="Teléfono Principal"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="+57 300 123 4567"
                        />
                        <InputField
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="contacto@instalacion.com"
                        />
                    </FormRow>

                    <InputField
                        label="Sitio Web"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        error={errors.website}
                        placeholder="https://www.instalacion.com"
                    />
                </FormSection>

                {/* Features and Amenities */}
                <FormSection title="Características y Servicios">
                    <div className="features-grid">
                        <label className="form-label">Servicios Disponibles</label>
                        <div className="features-list">
                            {availableFeatures.map((feature) => (
                                <div key={feature} className="feature-item">
                                    <label className="feature-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedFeatures.includes(feature)}
                                            onChange={() => handleFeatureToggle(feature)}
                                        />
                                        <span className="checkmark"></span>
                                        {feature}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TextAreaField
                        label="Servicios Adicionales"
                        name="additional_services"
                        value={formData.additional_services}
                        onChange={handleChange}
                        error={errors.additional_services}
                        placeholder="Describa otros servicios o características especiales"
                        rows={3}
                    />
                </FormSection>

                {/* Operating Information */}
                <FormSection title="Información Operativa">
                    <FormRow>
                        <InputField
                            label="Hora de Apertura"
                            name="opening_time"
                            type="time"
                            value={formData.opening_time}
                            onChange={handleChange}
                            error={errors.opening_time}
                        />
                        <InputField
                            label="Hora de Cierre"
                            name="closing_time"
                            type="time"
                            value={formData.closing_time}
                            onChange={handleChange}
                            error={errors.closing_time}
                        />
                    </FormRow>

                    <FormRow>
                        <InputField
                            label="Capacidad Total Aproximada"
                            name="total_capacity"
                            type="number"
                            value={formData.total_capacity}
                            onChange={handleChange}
                            error={errors.total_capacity}
                            placeholder="Número total de personas"
                        />
                        <InputField
                            label="Número de Espacios Deportivos"
                            name="sports_spaces_count"
                            type="number"
                            value={formData.sports_spaces_count}
                            onChange={handleChange}
                            error={errors.sports_spaces_count}
                            placeholder="Cantidad de espacios deportivos"
                        />
                    </FormRow>
                </FormSection>

                {/* Form Actions */}
                <FormActions>
                    <CancelButton onClick={handleCancel}>
                        Cancelar
                    </CancelButton>
                    <SubmitButton
                        isLoading={isLoading}
                        disabled={!isValid}
                    >
                        {initialData ? 'Actualizar Instalación' : 'Registrar Instalación'}
                    </SubmitButton>
                </FormActions>
            </form>
        </div>
    );
};

export default FacilityRegistrationForm;