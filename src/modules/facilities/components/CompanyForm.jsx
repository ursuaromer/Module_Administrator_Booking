import React, { useEffect } from 'react';
import { useCompanyForm } from '../hooks/useCompanyForm';
import { useCatalogs } from '../../../shared/hooks/useCatalogs';
import { InputField, SelectField, TextAreaField, CheckboxField, FormSection, FormRow, FormActions } from '../../../shared/components/FormComponents';
import Button from '../../../shared/components/Buttons';
import { Building2, Globe, FileText, MapPin, Phone, Smartphone, Mail, InfoIcon, Hash, Info, Calendar, DollarSign, ListChecks } from 'lucide-react';
import { getImageUrl } from '../../../shared/utils/formarText';

const CompanyRegistrationForm = ({ onSubmit, onCancel, initialData = null, mode = 'auto', parentCompany = null }) => {
    const {
        formData,
        errors,
        isLoading,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFormData,
        previews,
        handleFileChange
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
                parent_company_id: null  // ✅ null en lugar de string vacío
            }));
        }

        if (mode === 'subsidiary') {
            setFormData(prev => ({
                ...prev,
                parent_company_id: parentCompany?.id ? String(parentCompany.id) : prev.parent_company_id
            }));
        }
    }, [mode, parentCompany?.id, setFormData]);

    // Obtener opciones de países para el select
    const countryOptions = getCountriesForSelect();

    // Determinar si es una sucursal basada en el modo o en los datos iniciales (para edición)
    const isSubsidiary = mode === 'subsidiary' || (initialData && initialData.parent_company_id !== null && initialData.parent_company_id !== undefined && initialData.parent_company_id !== '');

    // Si es edición de una sucursal, establecer el parent_company_id como readonly
    useEffect(() => {
        if (initialData && initialData.parent_company_id) {
            setFormData(prev => ({
                ...prev,
                parent_company_id: String(initialData.parent_company_id)
            }));
        }
    }, [initialData?.parent_company_id, setFormData]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const result = await handleSubmit();
        if (result.success && onSubmit) {
            const parentCompanyId = mode === 'subsidiary'
                ? (parentCompany?.id ?? formData.parent_company_id)
                : formData.parent_company_id;

            onSubmit({
                ...result.data,
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

    return (
        <form onSubmit={handleFormSubmit} className="registration-form">

            {/* Basic Company Information */}
            <FormSection title="Información Básica de la Empresa" Icon={Building2}>
                {mode === 'subsidiary' && parentCompany?.name && (
                    <FormRow>
                        <InputField
                            label="Compañía Padre"
                            name="parent_company_name"
                            value={parentCompany.name}
                            onChange={() => { }}
                            disabled
                            error={errors.parent_company_id}
                            icon={Building2}
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
                        variant
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
                        icon={Building2}
                        variant='variant2'
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
                        icon={FileText}
                        variant='variant2'
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
                        icon={MapPin}
                        variant='variant2'
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
                        icon={Smartphone}
                        variant='variant2'
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
                        icon={Phone}
                        variant='variant2'
                    />
                </FormRow>
            </FormSection>

            {/* La imagen principal de sucursal se gestiona desde Configuración → tab Operativo */}

            {/* Address Information */}
            <FormSection title="Información de Dirección" Icon={MapPin}>
                <InputField
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.address}
                    placeholder="Calle 123 #45-67"
                    required
                    icon={MapPin}
                    variant='variant2'
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
                        icon={Hash}
                        variant='variant2'
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
                        icon={Globe}
                        variant='variant2'
                    />
                </FormRow>
                <FormRow >
                    <TextAreaField
                        label={isSubsidiary ? 'Descripción de la Sucursal' : 'Descripción de la Empresa'}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.description}
                        placeholder="Describe brevemente tu empresa y los servicios que ofrece..."
                        rows={4}
                        icon={Info}
                    />
                </FormRow>
            </FormSection>

            {/* Additional Information */}
            <FormSection title="Información Adicional" Icon={InfoIcon}>
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
                        icon={MapPin}
                        variant='variant2'
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
                        icon={MapPin}
                        variant='variant2'
                    />
                    <CheckboxField
                        label="Estacionamiento Disponible"
                        name="parking_available"
                        checked={formData.parking_available}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.parking_available}
                    />
                </FormRow>

                {isSubsidiary && (
                    <>
                        <FormRow>
                            <InputField
                                label="Horario de Apertura"
                                name="opening_time"
                                type="time"
                                value={formData.opening_time}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.opening_time}
                                icon={Calendar}
                            />
                            <InputField
                                label="Horario de Cierre"
                                name="closing_time"
                                type="time"
                                value={formData.closing_time}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.closing_time}
                                icon={Calendar}
                            />
                            <InputField
                                label="Precio Mínimo"
                                name="min_price"
                                type="number"
                                step="0.01"
                                value={formData.min_price}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.min_price}
                                placeholder="0.00"
                                icon={DollarSign}
                            />
                        </FormRow>
                        <FormRow>
                            <InputField
                                label="Características (separadas por comas)"
                                name="features"
                                value={formData.features}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.features}
                                placeholder="Wifi, Estacionamiento, Cafetería..."
                                icon={ListChecks}
                            />
                        </FormRow>
                    </>
                )}
            </FormSection>

            {/* Form Actions */}
            <FormActions>
                <Button
                    text='Cancelar'
                    onClick={handleCancel}
                    variant='cancel'
                    size='lg'
                />
                <Button
                    loading={isLoading}
                    disabled={!isValid}
                    type='submit'
                    size='lg'
                    text={initialData
                        ? isSubsidiary
                            ? 'Actualizar Sucursal'
                            : 'Actualizar Empresa'
                        : isSubsidiary
                            ? 'Registrar Sucursal'
                            : 'Registrar Empresa'}
                />

            </FormActions>
        </form>
    );
};

export default CompanyRegistrationForm;
