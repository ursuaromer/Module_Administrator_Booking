import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const getRedirectPath = (roles = [], companyIds = []) => {
    if (roles.includes('system')) return '/dashboard';
    if (roles.includes('super_admin')) return '/companys';
    // administrador y empleado van directo a su sucursal
    if (companyIds.length > 0) return `/subsidiary/${companyIds[0]}`;
    return '/dashboard';
};

const useLogin = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const email = usuario.trim();
        const password = contrasena;

        if (!email || !password) {
            toast.error('Email y contraseña son obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await login({ email, password });
            toast.success('Sesión iniciada');
            const redirect = getRedirectPath(result.roles, result.companyIds);
            navigate(redirect);
        } catch (error) {
            toast.error(error?.message || 'Error al iniciar sesión');
        } finally {
            setIsSubmitting(false);
        }
    }, [contrasena, isSubmitting, login, navigate, usuario]);

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return {
        handleSubmit,
        handleShowPassword,
        usuario,
        setUsuario,
        contrasena,
        setContrasena,
        showPassword,
        isSubmitting
    };
};

export default useLogin;
