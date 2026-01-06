import React, { useEffect } from 'react';
import { useCompanyForm } from '../hooks/useCompanyForm';
import { useCatalogs } from '../../../shared/hooks/useCatalogs';
import { InputField, SelectField, TextAreaField, CheckboxField, FormSection, FormRow, SubmitButton, CancelButton, FormActions, ErrorSummary } from './FormComponents';

const CompanyRegistrationForm = ({ onSubmit, onCancel, initialData = null, mode = 'auto', parentCompany = null, onBelongsToCompanyChange }) => {
    const {
        formData,
        errors,
        isLoading,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFormData
    } = useCompanyForm(initialData);

    // Hook global para catálogos
    const {
        loadCountries,
        isLoadingCountries,
        countriesError,
        getCountriesForSelect
    } = useCatalogs();

    // Cargar países al montar el componente
    useEffect(() => {
        loadCountries();
    }, [loadCountries]);

    useEffect(() => {
        if (mode === 'parent') {
            setFormData(prev => ({
                ...prev,
                belongs_to_company: false,
                parent_company_id: ''
            }));
        }

        if (mode === 'subsidiary') {
            setFormData(prev => ({
                ...prev,
                belongs_to_company: true,
                parent_company_id: parentCompany?.id ? String(parentCompany.id) : prev.parent_company_id
            }));
        }
    }, [mode, parentCompany?.id, setFormData]);

    // Obtener opciones de países para el select
    const countryOptions = getCountriesForSelect();

    const isSubsidiary = mode === 'subsidiary' || (mode === 'auto' && formData.belongs_to_company);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const result = await handleSubmit();
        if (result.success && onSubmit) {
            const belongsToCompany = mode === 'subsidiary' ? true : Boolean(formData.belongs_to_company);
            const parentCompanyId = mode === 'subsidiary'
                ? (parentCompany?.id ?? formData.parent_company_id)
                : formData.parent_company_id;

            onSubmit({
                ...result.data,
                belongs_to_company: belongsToCompany,
                parent_company_id: parentCompanyId
            });
        }
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) {
            onCancel();
        }
    };

    const hideBelongsToCompany = mode === 'parent' || mode === 'subsidiary';

    return (
        <div className="company-registration-form">
            <div className="form-header">
                <h2>
                    {initialData
                        ? 'Editar Empresa Deportiva'
                        : isSubsidiary
                            ? 'Registrar Nueva Sucursal'
                            : 'Registrar Nueva Compañía'}
                </h2>
                <p>
                    {isSubsidiary
                        ? 'Complete la información de la sucursal deportiva'
                        : 'Complete la información de la compañía deportiva'}
                </p>
            </div>

            <form onSubmit={handleFormSubmit} className="registration-form">
                <ErrorSummary errors={Object.values(errors).filter(Boolean)} />

                {/* Basic Company Information */}
                <FormSection title="Información Básica de la Empresa">
                    <FormRow>
                        {!hideBelongsToCompany && (
                            <CheckboxField
                                label="¿Pertenece a una compañía?"
                                name="belongs_to_company"
                                checked={formData.belongs_to_company}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (onBelongsToCompanyChange) {
                                        onBelongsToCompanyChange(Boolean(e?.target?.checked));
                                    }
                                }}
                            />
                        )}
                    </FormRow>

                    {mode === 'subsidiary' && parentCompany?.name && (
                        <FormRow>
                            <InputField
                                label="Compañía Padre"
                                name="parent_company_name"
                                value={parentCompany.name}
                                onChange={() => { }}
                                disabled
                                error={errors.parent_company_id}
                            />
                        </FormRow>
                    )}

                    <FormRow>
                        <SelectField
                            label="País"
                            name="country_id"
                            value={formData.country_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            options={countryOptions}
                            error={errors.country_id || countriesError}
                            disabled={isLoadingCountries}
                            placeholder={isLoadingCountries ? "Cargando países..." : "Selecciona un país"}
                            required
                        />
                        <InputField
                            label={isSubsidiary ? 'Nombre de la Sucursal' : 'Nombre de la Empresa'}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.name}
                            placeholder="Ej: Deportes XYZ S.A.S"
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <InputField
                            label="Número de Documento"
                            name="document"
                            value={formData.document}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.document}
                            placeholder="Número de identificación fiscal"
                            required
                        />
                        <InputField
                            label="Código de Ubicación Geográfica"
                            name="ubigeo_code"
                            value={formData.ubigeo_code}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.ubigeo_code}
                            placeholder="Código UBIGEO"
                            required
                        />
                    </FormRow>

                    <FormRow>
                        <InputField
                            label="Teléfono Celular"
                            name="phone_cell"
                            type="tel"
                            value={formData.phone_cell}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.phone_cell}
                            placeholder="+57 300 123 4567"
                            required
                        />
                        <InputField
                            label="Teléfono Fijo"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.phone}
                            placeholder="+57 1 234 5678"
                            required
                        />
                    </FormRow>
                </FormSection>

                {/* Address Information */}
                <FormSection title="Información de Dirección">
                    <InputField
                        label="Dirección"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.address}
                        placeholder="Calle 123 #45-67"
                        required
                    />

                    <FormRow>
                        <InputField
                            label="Código Postal"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.postal_code}
                            placeholder="110111"
                        />
                        <InputField
                            label="Sitio Web"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.website}
                            placeholder="https://www.empresa.com"
                        />
                    </FormRow>

                    <TextAreaField
                        label={isSubsidiary ? 'Descripción de la Sucursal' : 'Descripción de la Empresa'}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.description}
                        placeholder="Describe brevemente tu empresa y los servicios que ofrece..."
                        rows={4}
                    />
                </FormSection>

                {/* Additional Information */}
                <FormSection title="Información Adicional">
                    <FormRow>
                        <CheckboxField
                            label="Estacionamiento Disponible"
                            name="parking_available"
                            checked={formData.parking_available}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.parking_available}
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
                            onBlur={handleBlur}
                            error={errors.latitude}
                            placeholder="4.6097"
                        />
                        <InputField
                            label="Longitud"
                            name="longitude"
                            type="number"
                            step="any"
                            value={formData.longitude}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.longitude}
                            placeholder="-74.0817"
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
                        {initialData
                            ? 'Actualizar Empresa'
                            : isSubsidiary
                                ? 'Registrar Sucursal'
                                : 'Registrar Empresa'}
                    </SubmitButton>
                </FormActions>
            </form>
        </div>
    );
};

export default CompanyRegistrationForm;
