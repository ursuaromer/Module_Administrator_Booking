/**
 * Recorta un texto a una longitud específica y agrega "..." si es necesario.
 * 
 * @param {string} text - Texto original.
 * @param {number} maxLength - Longitud máxima deseada.
 * @returns {string} Texto recortado con puntos suspensivos.
 */
export function truncateText(text, maxLength) {
    if (!text || typeof text !== "string") return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}


// Formatea un texto para que la primera letra de cada palabra sea mayúscula
export function capitalizeText(text) {
    if (!text || typeof text !== "string") return "";
    return text.replace(/\b\w/g, (match) => match.toUpperCase());
}

// Formatea texto a MAYUSCULA
export function uppercaseText(text) {
    if (!text || typeof text !== "string") return "";
    return text.toUpperCase();
}

// Formatea una fecha a string legible (es-ES)
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
};

// Obtiene la clase de estado para elementos activos/inactivos
export const getStatusClass = (isEnabled) => {
    if (typeof isEnabled === 'boolean') {
        return !isEnabled ? 'status-active' : 'status-inactive';
    }
    return isEnabled === 'A' ? 'status-active' : 'status-inactive';
};

// Obtiene el texto de estado para elementos activos/inactivos
export const getStatusText = (isEnabled) => {
    if (typeof isEnabled === 'boolean') {
        return !isEnabled ? 'Activo' : 'Inactivo';
    }
    return isEnabled === 'A' ? 'Activo' : 'Inactivo';
};

/**
 * Construye la URL completa para una imagen almacenada localmente.
 * 
 * @param {string} path - Ruta relativa de la imagen.
 * @returns {string} URL completa.
 */
export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5010/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
};


// 11. Formatear duración en minutos a "Xh Ymin"
export const formatDuration = (totalMinutes) => {
    if (!totalMinutes && totalMinutes !== 0) return 'N/A';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const hPart = hours > 0 ? `${hours}h` : '';
    const mPart = minutes > 0 ? `${minutes}min` : '';
    
    return `${hPart}${hPart && mPart ? ' ' : ''}${mPart}` || '0min';
}