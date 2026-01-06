import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';

class CountryService {
    /**
     * Obtiene todos los países desde la API
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
}

export default CountryService;