import React, { useEffect } from 'react';
import { useSpaceForm } from '../hooks/useSpaceForm';
import { useCatalogs } from '../../../shared/hooks/useCatalogs';
import { InputField, SelectField, TextAreaField, FormSection, FormRow, FormActions} from '../../../shared/components/FormComponents';
import Button from '../../../shared/components/Buttons';

const SpaceForm = ({ onSubmit, onCancel, initialData = null, companyId = null, sucursalId = null }) => {
    const {
        formData,
        errors,
        loading,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit
    } = useSpaceForm(initialData);

    const {
        loadSportTypes,
        loadSurfaceTypes,
        loadSportCategories,
        getSportTypesForSelect,
        getSurfaceTypesForSelect,
        getSportCategoriesForSelect,
        isLoadingSportTypes,
        isLoadingSurfaceTypes,
        isLoadingSportCategories
    } = useCatalogs();

    useEffect(() => {
        loadSportTypes();
        loadSurfaceTypes();
        loadSportCategories();
    }, [loadSportTypes, loadSurfaceTypes, loadSportCategories]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const result = await handleSubmit(e, { companyId, sucursalId });
        if (result && onSubmit) {
            onSubmit(result);
        }
    };

    return (
        <div className="space-registration-form">
            <form onSubmit={handleFormSubmit} className="registration-form">

                <FormSection title="Información General del Espacio">
                    <FormRow>
                        <InputField
                            label="Nombre del Espacio"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.name}
                            placeholder="Ej: Cancha de Fútbol 7 Principal"
                            required
                        />
                        <SelectField
                            label="Estado"
                            name="status_space"
                            value={formData.status_space}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.status_space}
                            options={[
                                { value: 'ACTIVE', label: 'Activo' },
                                { value: 'INACTIVE', label: 'Inactivo' },
                                { value: 'MAINTENANCE', label: 'Mantenimiento' }
                            ]}
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <SelectField
                            label="Deporte"
                            name="sport_type_id"
                            value={formData.sport_type_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.sport_type_id}
                            options={getSportTypesForSelect().map(s => ({ value: s.id, label: s.label }))}
                            loading={isLoadingSportTypes}
                            required
                        />
                        <SelectField
                            label="Categoría"
                            name="sport_category_id"
                            value={formData.sport_category_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.sport_category_id}
                            options={getSportCategoriesForSelect().map(c => ({ value: c.id, label: c.label }))}
                            loading={isLoadingSportCategories}
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <SelectField
                            label="Tipo de Superficie"
                            name="surface_type_id"
                            value={formData.surface_type_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.surface_type_id}
                            options={getSurfaceTypesForSelect().map(s => ({ value: s.id, label: s.label }))}
                            loading={isLoadingSurfaceTypes}
                            required
                        />
                        <InputField
                            label="Dimensiones"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.dimensions}
                            placeholder="Ej: 20x40 metros"
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <InputField
                            label="Capacidad (Personas)"
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.capacity}
                            required
                        />
                    </FormRow>

                    <TextAreaField
                        label="Descripción"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.description}
                        placeholder="Describa las características del espacio..."
                    />
                    <InputField
                        label="Equipamiento (separados por comas)"
                        name="equipment"
                        value={formData.equipment}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.equipment}
                        placeholder="Ej: Balones, Chalecos, Redes"
                    />
                </FormSection>

                <FormSection title="Reglas de Reserva">
                    <FormRow>
                        <InputField
                            label="Mínimo de Reserva (min)"
                            name="minimum_booking_minutes"
                            type="number"
                            value={formData.minimum_booking_minutes}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.minimum_booking_minutes}
                            placeholder="Ej: 60"
                            required
                        />
                        <InputField
                            label="Máximo de Reserva (min)"
                            name="maximum_booking_minutes"
                            type="number"
                            value={formData.maximum_booking_minutes}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.maximum_booking_minutes}
                            placeholder="Ej: 480"
                            required
                        />
                        <InputField
                            label="Buffer entre Reservas (min)"
                            name="booking_buffer_minutes"
                            type="number"
                            value={formData.booking_buffer_minutes}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.booking_buffer_minutes}
                            required
                        />
                    </FormRow>
                </FormSection>

                <FormActions>
                    <Button
                        type="button"
                        variant="cancel"
                        onClick={onCancel}
                        text='Cancelar'
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={!isValid}
                        text={initialData ? 'Actualizar Espacio' : 'Registrar Espacio'}
                    />
                </FormActions>
            </form>
        </div>
    );
};

export default SpaceForm;
