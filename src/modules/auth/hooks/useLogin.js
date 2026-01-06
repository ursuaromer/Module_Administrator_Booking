import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const useLogin = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de autenticación aquí
        console.log('Usuario:', usuario, 'Contraseña:', contrasena);
        navigate('/dashboard')
    };

    const handleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return {
        handleSubmit,
        handleShowPassword,
        usuario,
        setUsuario,
        contrasena,
        setContrasena,
        showPassword
    }
}

export default useLogin