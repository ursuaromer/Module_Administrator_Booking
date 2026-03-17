/**
 * Maneja errores de Axios y devuelve un mensaje de error amigable
 * @param {Error} error - Error capturado en el catch
 * @returns {string} Mensaje de error amigable para el usuario
 */
export const handleAxiosError = (error) => {
    if (error.response && error.response.data && error.response.data.error) {
        // Error del servidor con mensaje personalizado
        const serverError = error.response.data.error;
        
        // Si hay detalles de validación (array de mensajes), mostrar solo el primero
        if (Array.isArray(serverError.details) && serverError.details.length > 0) {
            return serverError.details[0];
        }
        
        return serverError.message;
    } else if (error.request) {
        // No se recibió respuesta del servidor (error de red o servidor apagado)
        return 'No se pudo conectar con el servidor. Por favor verifica tu conexión a internet';
    } else {
        // Otro tipo de error
        return error?.message || 'Error inesperado.';
    }
};
