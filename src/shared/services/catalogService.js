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
        const response = await axiosInstance.get(`/catalogs/countries`);
        return response.data.data;
    }

    // ==================== TIPOS DE DEPORTE ====================
    
    /**
     * Obtiene todos los tipos de deporte
     * @returns {Promise<Array>} Lista de deportes
     */
    static async getSportTypes() {
        const response = await axiosInstance.get(`/catalogs/sport-types`);
        return response.data.data;
    }

    // ==================== DEPARTAMENTOS ====================
    
    /**
     * Obtiene departamentos por país
     * @param {string} countryId - ID del país
     * @returns {Promise<Array>} Lista de departamentos
     */
    static async getDepartmentsByCountry(countryId) {
        const response = await axiosInstance.get(`/catalogs/departments`, {
            params: { country_id: countryId }
        });
        return response.data.data;
    }

    // ==================== DISTRITOS ====================
    
    /**
     * Obtiene distritos por departamento
     * @param {string} departmentId - ID del departamento
     * @returns {Promise<Array>} Lista de distritos
     */
    static async getDistrictsByDepartment(departmentId) {
        const response = await axiosInstance.get(`/catalogs/districts`, {
            params: { department_id: departmentId }
        });
        return response.data.data;
    }

    // ==================== TIPOS DE SUPERFICIE ====================
    
    /**
     * Obtiene todos los tipos de superficie
     * @returns {Promise<Array>} Lista de tipos de superficie
     */
    static async getSurfaceTypes() {
        const response = await axiosInstance.get(`/catalogs/surface-types`);
        return response.data.data;
    }

    // ==================== CATEGORÍAS DE DEPORTE ====================
    
    /**
     * Obtiene todas las categorías de deporte
     * @returns {Promise<Array>} Lista de categorías
     */
    static async getSportCategories() {
        const response = await axiosInstance.get(`/catalogs/sport-categories`);
        return response.data.data;
    }

    // ==================== ROLES ====================
    
    /**
     * Obtiene todos los roles del sistema
     * @returns {Promise<Array>} Lista de roles
     */
    static async getRoles() {
        const response = await axiosInstance.get(`/catalogs/roles`);
        return response.data.data;
    }

    // ==================== TIPOS DE PAGO ====================

    /**
     * Obtiene todos los tipos de pago
     * @returns {Promise<Array>} Lista de tipos de pago
     */
    static async getPaymentTypes() {
        const response = await axiosInstance.get(`/catalogs/payment-types`);
        return response.data.data;
    }
}

export default CatalogService;