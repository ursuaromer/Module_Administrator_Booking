import React, { useState, useEffect } from 'react';
import { useSpaceForm } from '../hooks/useSpaceForm';
import {
    InputField,
    SelectField,
    TextAreaField,
    NumberField,
    FormSection,
    FormRow,
    SubmitButton,
    CancelButton,
    FormActions,
    ErrorSummary
} from './FormComponents';

const SpaceRegistrationForm = ({
    onSubmit,
    onCancel,
    initialData = null,
    facilities = [],
    surfaceTypes = []
}) => {
    const {
        formData,
        errors,
        isLoading,
        isValid,
        handleChange,
        handleSubmit,
        resetForm,
    } = useSpaceForm(initialData);

    // Status options
    const statusOptions = [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'maintenance', label: 'En Mantenimiento' },
        { value: 'reserved', label: 'Reservado' }
    ];

    // Facility options (converted from props)
    const facilityOptions = facilities.map(facility => ({
        value: facility.id,
        label: facility.name
    }));

    // Surface type options (converted from props)
    const surfaceTypeOptions = surfaceTypes.map(surface => ({
        value: surface.id,
        label: surface.name
    }));

    // Equipment options
    const availableEquipment = [
        'Arcos de fútbol',
        'Canastas de baloncesto',
        'Red de voleibol',
        'Red de tenis',
        'Marcador electrónico',
        'Iluminación artificial',
        'Sistema de sonido',
        'Gradas/Tribunas',
        'Vestuarios anexos',
        'Área de calentamiento',
        'Botiquín de primeros auxilios',
        'Conos y señalización',
        'Balones oficiales',
        'Cronómetro',
        'Silbatos'
    ];

    const [selectedEquipment, setSelectedEquipment] = useState([]);

    useEffect(() => {
        if (formData.equipment) {
            try {
                const equipment = typeof formData.equipment === 'string'
                    ? JSON.parse(formData.equipment)
                    : formData.equipment;
                setSelectedEquipment(Array.isArray(equipment) ? equipment : []);
            } catch (error) {
                setSelectedEquipment([]);
            }
        }
    }, [formData.equipment]);

    const handleEquipmentToggle = (equipment) => {
        const updatedEquipment = selectedEquipment.includes(equipment)
            ? selectedEquipment.filter(e => e !== equipment)
            : [...selectedEquipment, equipment];

        setSelectedEquipment(updatedEquipment);
        handleChange('equipment', JSON.stringify(updatedEquipment));
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
        setSelectedEquipment([]);
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="space-registration-form">
            <div className="form-header">
                <h2>{initialData ? 'Editar Espacio Deportivo' : 'Registrar Nuevo Espacio Deportivo'}</h2>
                <p>Complete la información del espacio deportivo</p>
            </div>

            <form onSubmit={handleFormSubmit} className="registration-form">
                <ErrorSummary errors={errors} />

                {/* Basic Space Information */}
                <FormSection title="Información Básica del Espacio">
                    <SelectField
                        label="Instalación Deportiva"
                        name="sport_facility_id"
                        value={formData.sport_facility_id}
                        onChange={handleChange}
                        options={facilityOptions}
                        error={errors.sport_facility_id}
                        placeholder="Seleccionar instalación..."
                        required
                    />

                    <FormRow>
                        <InputField
                            label="Nombre del Espacio"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="Ej: Cancha de Fútbol #1"
                            required
                        />
                        <SelectField
                            label="Tipo de Superficie"
                            name="surface_type_id"
                            value={formData.surface_type_id}
                            onChange={handleChange}
                            options={surfaceTypeOptions}
                            error={errors.surface_type_id}
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <NumberField
                            label="Capacidad Máxima"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            error={errors.capacity}
                            placeholder="Número de personas"
                            min="1"
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
                        placeholder="Descripción detallada del espacio deportivo"
                        rows={3}
                    />
                </FormSection>

                {/* Physical Specifications */}
                <FormSection title="Especificaciones Físicas">
                    <FormRow>
                        <NumberField
                            label="Largo (metros)"
                            name="length"
                            value={formData.length}
                            onChange={handleChange}
                            error={errors.length}
                            placeholder="Longitud en metros"
                            min="1"
                            step="0.1"
                        />
                        <NumberField
                            label="Ancho (metros)"
                            name="width"
                            value={formData.width}
                            onChange={handleChange}
                            error={errors.width}
                            placeholder="Anchura en metros"
                            min="1"
                            step="0.1"
                        />
                    </FormRow>

                    <InputField
                        label="Dimensiones Completas"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        error={errors.dimensions}
                        placeholder="Ej: 100m x 60m x 3m (alto)"
                    />

                    <TextAreaField
                        label="Características Especiales"
                        name="characteristics"
                        value={formData.characteristics}
                        onChange={handleChange}
                        error={errors.characteristics}
                        placeholder="Características especiales del espacio (techado, al aire libre, etc.)"
                        rows={3}
                    />
                </FormSection>

                {/* Equipment and Amenities */}
                <FormSection title="Equipamiento Disponible">
                    <div className="equipment-grid">
                        <label className="form-label">Equipamiento Incluido</label>
                        <div className="equipment-list">
                            {availableEquipment.map((equipment) => (
                                <div key={equipment} className="equipment-item">
                                    <label className="equipment-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedEquipment.includes(equipment)}
                                            onChange={() => handleEquipmentToggle(equipment)}
                                        />
                                        <span className="checkmark"></span>
                                        {equipment}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TextAreaField
                        label="Equipamiento Adicional"
                        name="additional_equipment"
                        value={formData.additional_equipment}
                        onChange={handleChange}
                        error={errors.additional_equipment}
                        placeholder="Describa otro equipamiento disponible"
                        rows={2}
                    />
                </FormSection>

                {/* Pricing Configuration */}
                <FormSection title="Configuración de Precios">
                    <FormRow>
                        <NumberField
                            label="Precio por Hora (Lunes-Viernes)"
                            name="price_per_hour_weekday"
                            value={formData.price_per_hour_weekday}
                            onChange={handleChange}
                            error={errors.price_per_hour_weekday}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                        <NumberField
                            label="Precio por Hora (Fines de Semana)"
                            name="price_per_hour_weekend"
                            value={formData.price_per_hour_weekend}
                            onChange={handleChange}
                            error={errors.price_per_hour_weekend}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <NumberField
                            label="Precio por Hora (Nocturno)"
                            name="price_per_hour_night"
                            value={formData.price_per_hour_night}
                            onChange={handleChange}
                            error={errors.price_per_hour_night}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                        <NumberField
                            label="Precio por Hora (Festivos)"
                            name="price_per_hour_holiday"
                            value={formData.price_per_hour_holiday}
                            onChange={handleChange}
                            error={errors.price_per_hour_holiday}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </FormRow>

                    <FormRow>
                        <NumberField
                            label="Depósito de Garantía"
                            name="deposit_amount"
                            value={formData.deposit_amount}
                            onChange={handleChange}
                            error={errors.deposit_amount}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                        <NumberField
                            label="Descuento por Reserva Múltiple (%)"
                            name="bulk_discount_percentage"
                            value={formData.bulk_discount_percentage}
                            onChange={handleChange}
                            error={errors.bulk_discount_percentage}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="1"
                        />
                    </FormRow>
                </FormSection>

                {/* Booking Configuration */}
                <FormSection title="Configuración de Reservas">
                    <FormRow>
                        <InputField
                            label="Hora de Inicio de Reservas"
                            name="booking_start_time"
                            type="time"
                            value={formData.booking_start_time}
                            onChange={handleChange}
                            error={errors.booking_start_time}
                            required
                        />
                        <InputField
                            label="Hora de Fin de Reservas"
                            name="booking_end_time"
                            type="time"
                            value={formData.booking_end_time}
                            onChange={handleChange}
                            error={errors.booking_end_time}
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <NumberField
                            label="Duración Mínima (minutos)"
                            name="min_booking_duration"
                            value={formData.min_booking_duration}
                            onChange={handleChange}
                            error={errors.min_booking_duration}
                            placeholder="60"
                            min="15"
                            step="15"
                            required
                        />
                        <NumberField
                            label="Duración Máxima (minutos)"
                            name="max_booking_duration"
                            value={formData.max_booking_duration}
                            onChange={handleChange}
                            error={errors.max_booking_duration}
                            placeholder="480"
                            min="15"
                            step="15"
                        />
                    </FormRow>

                    <FormRow>
                        <NumberField
                            label="Tiempo de Preparación (minutos)"
                            name="buffer_time_before"
                            value={formData.buffer_time_before}
                            onChange={handleChange}
                            error={errors.buffer_time_before}
                            placeholder="15"
                            min="0"
                            step="5"
                        />
                        <NumberField
                            label="Tiempo de Limpieza (minutos)"
                            name="buffer_time_after"
                            value={formData.buffer_time_after}
                            onChange={handleChange}
                            error={errors.buffer_time_after}
                            placeholder="15"
                            min="0"
                            step="5"
                        />
                    </FormRow>

                    <FormRow>
                        <NumberField
                            label="Días de Anticipación Máxima"
                            name="advance_booking_days"
                            value={formData.advance_booking_days}
                            onChange={handleChange}
                            error={errors.advance_booking_days}
                            placeholder="30"
                            min="1"
                            max="365"
                        />
                        <NumberField
                            label="Horas de Cancelación Gratuita"
                            name="cancellation_hours"
                            value={formData.cancellation_hours}
                            onChange={handleChange}
                            error={errors.cancellation_hours}
                            placeholder="24"
                            min="1"
                            max="168"
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
                        {initialData ? 'Actualizar Espacio' : 'Registrar Espacio'}
                    </SubmitButton>
                </FormActions>
            </form>
        </div>
    );
};

export default SpaceRegistrationForm;