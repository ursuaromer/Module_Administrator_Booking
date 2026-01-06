import axiosInstance from '../../../shared/utils/axiosInstance';

const toApiErrorPayload = (error) => {
    if (error?.response?.data) return error.response.data;
    return { success: false, error: { code: 'NETWORK_ERROR', message: error?.message || 'Error inesperado' } };
};

// Servicio para el manejo de compañías
class CompanyService {

    // Registra una nueva compañía
    async registerCompany(companyData) {
        try {
            const response = await axiosInstance.post('/companies', companyData);
            return response.data;
        } catch (error) {
            return toApiErrorPayload(error);
        }
    }

    // Obtener todas las compañías
    async getAllCompanies(params = {}) {
        const finalParams = { page: 1, limit: 100, status: 'ACTIVE', ...params };

        try {
            const response = await axiosInstance.get('/companies/get-companys', { params: finalParams });
            return response.data;
        } catch (error) {
            return toApiErrorPayload(error);
        }
    }

    // Obtener detalles completos de una compañía por ID
    async getCompanyDetails(companyId) {
        try {
            const response = await axiosInstance.get(`/companies/${companyId}`);
            return response.data;
        } catch (error) {
            return toApiErrorPayload(error);
        }
    }
}

// Export singleton instance
export default new CompanyService();
