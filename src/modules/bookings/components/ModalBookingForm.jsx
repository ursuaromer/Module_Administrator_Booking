import React, { useState, useEffect, useCallback } from 'react';
import { Button, InputField, SelectField, FormRow, FormSection, SearchSelect, FormActions } from '../../../shared/components';
import { FaUser, FaPhone, FaEnvelope, FaClock, FaCalendarAlt, FaMoneyBillWave, FaIdCard } from 'react-icons/fa';
import '../styles/ModalBookingForm.css';
import { User, Trash2, Search } from 'lucide-react';
import userService from '../../users/services/userService';

/**
 * Formulario para crear una nueva reserva desde el panel administrativo.
 */
const ModalBookingForm = ({
    initialData,
    onClose,
    onSave,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        user_id: null,
        client_name: '',
        client_last_name: '',
        phone: '',
        email: '',
        dni: '',
        booking_date: initialData?.date || '',
        start_time: initialData?.time || '08:00',
        duration: 60, // por defecto 60 min
        payment_method: 'IN_PERSON',
        total_amount: 0,
        status: 'CONFIRMED'
    });

    // Estado para almacenar los resultados de búsqueda locales y permitir el autocompletado
    const [lastSearchResults, setLastSearchResults] = useState([]);

    // Función de búsqueda para SearchSelect
    const handleRemoteSearch = async (term) => {
        try {
            const response = await userService.getAllUsers({ searchTerm: term, limit: 10 });
            const users = response.data || [];
            setLastSearchResults(users);
            return users.map(user => ({
                value: user.user_id,
                label: `${user.name} ${user.lastName}`,
                subLabel: `DNI: ${user.dni || 'N/A'} - Tel: ${user.phone || 'N/A'}`
            }));
        } catch (error) {
            console.error("Error searching users:", error);
            return [];
        }
    };

    const handleSearchSelectChange = (e) => {
        const userId = e.target.value;
        if (!userId) return;

        const user = lastSearchResults.find(u => String(u.user_id) === String(userId));
        if (user) {
            handleSelectUser(user);
        }
    };

    const handleSelectUser = (user) => {
        setFormData(prev => ({
            ...prev,
            user_id: user.user_id,
            client_name: user.name || '',
            client_last_name: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            dni: user.dni || ''
        }));
    };

    const clearSelection = () => {
        setFormData(prev => ({
            ...prev,
            user_id: null,
            client_name: '',
            client_last_name: '',
            email: '',
            phone: '',
            dni: ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form className="modal-booking-form" onSubmit={handleSubmit}>

            {/* ── Buscador de Usuarios ────────────────────────────────────────── */}
            <SearchSelect
                label="Buscar Cliente (DNI, Nombre, Telefono)"
                placeholder="Escribe para buscar..."
                onSearch={handleRemoteSearch}
                onChange={handleSearchSelectChange}
                variant={true}
                minChars={3}
                icon={Search}
                iconPosition='left'
            />

            <div className="separator"></div>

            {/* ── Información del Cliente ────────────────────────────────────────── */}
            <FormSection
                Icon={User}
                title="Información del Cliente"
                rightElement={formData.email && (
                    <Button
                        Icon={Trash2}
                        variant="cancel"
                        size="sm"
                        onClick={clearSelection}
                        title="Limpiar selección"
                    />
                )}
            >
                <FormRow>
                    <InputField
                        label="DNI"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        placeholder="Documento de identidad"
                        icon={FaIdCard}
                        iconPosition="left"
                        variant='variant2'
                    />
                    <InputField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="cliente@correo.com"
                        icon={FaEnvelope}
                        iconPosition="left"
                        variant='variant2'
                    />
                </FormRow>
                <FormRow>
                    <InputField
                        label="Nombres"
                        name="client_name"
                        value={formData.client_name}
                        onChange={handleChange}
                        placeholder="Nombre del cliente"
                        icon={User}
                        iconPosition="left"
                        variant='variant2'
                    />
                    <InputField
                        label="Apellidos"
                        name="client_last_name"
                        value={formData.client_last_name}
                        onChange={handleChange}
                        placeholder="Apellidos del cliente"
                        icon={User}
                        iconPosition="left"
                        variant='variant2'
                    />
                </FormRow>
                <FormRow>
                    <InputField
                        label="Teléfono"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="999 999 999"
                        icon={FaPhone}
                        iconPosition="left"
                        variant='variant2'
                    />
                </FormRow>
            </FormSection>

            {/* ── Detalles de la Reserva ────────────────────────────────────────── */}
            <FormSection Icon={FaCalendarAlt} title="Detalles de la Reserva">
                <FormRow>
                    <InputField
                        label="Fecha"
                        type='date'
                        name="booking_date"
                        value={formData.booking_date}
                        onChange={handleChange}
                        placeholder="Seleccione una fecha"
                        required
                        icon={FaCalendarAlt}
                        iconPosition="left"
                        variant='variant2'
                        disabled
                    />
                    <InputField
                        label="Hora Inicio"
                        type='time'
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        placeholder="Seleccione una hora"
                        required
                        icon={FaClock}
                        iconPosition="left"
                        variant='variant2'
                    />
                    <SelectField
                        label="Duración"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        options={[
                            { value: 30, label: '30 min' },
                            { value: 60, label: '60 min' },
                            { value: 90, label: '90 min' },
                            { value: 120, label: '120 min' }
                        ]}
                        required
                        icon={FaMoneyBillWave}
                        iconPosition="left"
                        variant='variant2'
                    />
                </FormRow>
            </FormSection>
            {/* ── Detalles de la Reserva ────────────────────────────────────────── */}
            <FormSection Icon={FaMoneyBillWave} title="Pago Presencial">
                <FormRow>
                    <InputField
                        label="Monto Total (S/)"
                        name="total_amount"
                        value={formData.total_amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        required
                        icon={FaMoneyBillWave}
                        iconPosition="left"
                        variant='variant2'
                    />
                    <div className="input_group">
                        <label className='input_label_static'>Estado Inicial</label>
                        <div className="status-confirmed-badge status-pending-payment">
                            RESERVA CONFIRMADA - PAGO PENDIENTE
                        </div>
                    </div>
                </FormRow>
            </FormSection>
            <FormActions>
                <Button
                    text="Cancelar"
                    variant="cancel"
                    type="button"
                    onClick={onClose}
                />
                <Button
                    text={loading ? "Guardando..." : "Crear Reserva"}
                    variant="primary"
                    type="submit"
                    disabled={loading}
                />
            </FormActions>
        </form>
    );
};

export default ModalBookingForm;
