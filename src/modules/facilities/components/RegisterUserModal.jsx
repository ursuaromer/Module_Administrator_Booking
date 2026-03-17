/**
 * RegisterUserModal
 * Modal para registrar un usuario admin vinculado a una empresa o sucursal.
 *
 * context='company'    → rol disponible: super_admin (propietario)
 * context='subsidiary' → roles disponibles: administrador, empleado
 */
import { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Modal from '../../../shared/components/Modal';
import Button from '../../../shared/components/Buttons';
import { InputField, SelectField } from '../../../shared/components/FormComponents';
import userService from '../../users/services/userService';
import toast from 'react-hot-toast';

const ROLES_BY_CONTEXT = {
    company: [
        { value: 'super_admin', label: 'Super Admin (Propietario)' }
    ],
    subsidiary: [
        { value: 'administrador', label: 'Administrador' },
        { value: 'empleado',      label: 'Empleado' }
    ]
};

const INITIAL_FORM = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: ''
};

const RegisterUserModal = ({ isOpen, onClose, companyId, context = 'subsidiary', onSuccess }) => {
    const [form, setForm] = useState({ ...INITIAL_FORM, role: ROLES_BY_CONTEXT[context][0]?.value || '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const roleOptions = ROLES_BY_CONTEXT[context] || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.first_name.trim()) errs.first_name = 'El nombre es obligatorio';
        if (!form.last_name.trim())  errs.last_name  = 'El apellido es obligatorio';
        if (!form.email.trim())      errs.email      = 'El correo es obligatorio';
        if (!form.password)          errs.password   = 'La contraseña es obligatoria';
        else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(form.password))
            errs.password = 'Mínimo 8 caracteres, una mayúscula y un número';
        if (!form.role) errs.role = 'El rol es obligatorio';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await userService.registerAdminUser({ ...form, company_id: companyId });
            toast.success('Usuario registrado exitosamente');
            setForm({ ...INITIAL_FORM, role: ROLES_BY_CONTEXT[context][0]?.value || '' });
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.error?.message || err?.message || 'Error al registrar usuario');
        } finally {
            setSubmitting(false);
        }
    };

    const title = context === 'company' ? 'Registrar Propietario' : 'Registrar Personal';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} Icon={UserPlus} size="small">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InputField
                        label="Nombre"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        error={errors.first_name}
                        required
                        variant="variant2"
                    />
                    <InputField
                        label="Apellido"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        error={errors.last_name}
                        required
                        variant="variant2"
                    />
                </div>

                <InputField
                    label="Correo electrónico"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    variant="variant2"
                />

                <div style={{ position: 'relative' }}>
                    <InputField
                        label="Contraseña"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                        variant="variant2"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        style={{
                            position: 'absolute', right: 10, top: 30,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-light)', padding: '2px'
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <SelectField
                    label="Rol"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    error={errors.role}
                    required
                    variant="variant2"
                    options={roleOptions}
                />

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                    <Button
                        text="Cancelar"
                        variant="cancel"
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                    />
                    <Button
                        text={submitting ? 'Registrando...' : 'Registrar'}
                        variant="primary"
                        type="submit"
                        Icon={UserPlus}
                        disabled={submitting}
                        loading={submitting}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default RegisterUserModal;
