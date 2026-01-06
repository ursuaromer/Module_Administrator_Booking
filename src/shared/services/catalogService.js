import axiosInstance from '../utils/axiosInstance';

/**
 * Servicio centralizado para manejo de catálogos globales
 * Maneja países, deportes, departamentos, distritos, etc.
 */
class CatalogService {
    
    // ==================== PAÍSES ====================
    
    /**
     * Obtiene todos los países
     * @returns {Promise<Array>} Lista de países en formato {value, label}
     */
    static async getCountries() {
        try {
            const response = await axiosInstance.get(`/countries`);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al obtener países');
            }
        } catch (error) {
            console.error('Error al obtener países:', error);
            throw new Error('Error al cargar la lista de países');
        }
    }

    // ==================== TIPOS DE DEPORTE ====================
    
    /**
     * Obtiene todos los tipos de deporte
     * @returns {Promise<Array>} Lista de deportes
     */
    static async getSportTypes() {
        try {
            const response = await axiosInstance.get(`/sport-types`);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al obtener tipos de deporte');
            }
        } catch (error) {
            console.error('Error al obtener tipos de deporte:', error);
            throw new Error('Error al cargar los tipos de deporte');
        }
    }

    // ==================== DEPARTAMENTOS ====================
    
    /**
     * Obtiene departamentos por país
     * @param {string} countryId - ID del país
     * @returns {Promise<Array>} Lista de departamentos
     */
    static async getDepartmentsByCountry(countryId) {
        try {
            const response = await axiosInstance.get(`/departments`, {
                params: { country_id: countryId }
            });
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al obtener departamentos');
            }
        } catch (error) {
            console.error('Error al obtener departamentos:', error);
            throw new Error('Error al cargar los departamentos');
        }
    }

    // ==================== DISTRITOS ====================
    
    /**
     * Obtiene distritos por departamento
     * @param {string} departmentId - ID del departamento
     * @returns {Promise<Array>} Lista de distritos
     */
    static async getDistrictsByDepartment(departmentId) {
        try {
            const response = await axiosInstance.get(`/districts`, {
                params: { department_id: departmentId }
            });
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al obtener distritos');
            }
        } catch (error) {
            console.error('Error al obtener distritos:', error);
            throw new Error('Error al cargar los distritos');
        }
    }

    // ==================== TIPOS DE SUPERFICIE ====================
    
    /**
     * Obtiene todos los tipos de superficie
     * @returns {Promise<Array>} Lista de tipos de superficie
     */
    static async getSurfaceTypes() {
        try {
            const response = await axiosInstance.get(`/surface-types`);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al obtener tipos de superficie');
            }
        } catch (error) {
            console.error('Error al obtener tipos de superficie:', error);
            throw new Error('Error al cargar los tipos de superficie');
        }
    }

    // ==================== CATEGORÍAS DE DEPORTE ====================
    
    /**
     * Obtiene todas las categorías de deporte
     * @returns {Promise<Array>} Lista de categorías
     */
    static async getSportCategories() {
        try {
            const response = await axiosInstance.get(`/sport-categories`);
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error al obtener categorías de deporte');
            }
        } catch (error) {
            console.error('Error al obtener categorías de deporte:', error);
            throw new Error('Error al cargar las categorías de deporte');
        }
    }
}

export default CatalogService;