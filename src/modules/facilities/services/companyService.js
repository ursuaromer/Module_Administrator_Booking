import axiosInstance from '../../../shared/utils/axiosInstance';

// Servicio para el manejo de compañías y sucursales
class CompanyService {

    // Registra una nueva compañía o sucursal
    async registerCompany(companyData) {
        const response = await axiosInstance.post('/companies/register', companyData);
        return response.data;
    }

    // Obtener todas las compañías principales
    async getAllCompanies(params = {}) {
        const finalParams = { page: 1, limit: 20, status: 'ACTIVE', ...params };
        const response = await axiosInstance.get('/companies/get-companys', { params: finalParams });
        return response.data;
    }

    // Obtener detalles completos de una compañía o sucursal por ID
    async getCompanyDetails(companyId) {
        const response = await axiosInstance.get(`/companies/details/${companyId}`);
        return response.data;
    }

    // Obtener detalles de una sucursal — el backend rechaza con 403 si el ID es de una empresa
    async getSubsidiaryDetails(subsidiaryId) {
        const response = await axiosInstance.get(`/companies/subsidiary/${subsidiaryId}`);
        return response.data;
    }

    // Actualizar una compañía o sucursal existente
    async updateCompany(companyId, companyData) {
        const response = await axiosInstance.put(`/companies/update/${companyId}`, companyData);
        return response.data;
    }

    // Servicio para activar/inactivar (Empresa o Sucursal)
    async activeInactiveCompany(companyId) {
        const response = await axiosInstance.put(`/companies/active-inactive/${companyId}`);
        return response.data;
    }
}

// Export singleton instance
export default new CompanyService();
