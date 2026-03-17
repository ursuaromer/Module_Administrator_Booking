import axiosInstance from '../../../shared/utils/axiosInstance';

// Servicio para el manejo de usuarios
class UserService {
    // Obtener todos los usuarios con filtros y paginación (system)
    async getAllUsers(params = {}) {
        const finalParams = { page: 1, limit: 10, ...params };
        const response = await axiosInstance.get('/users/get-all-users', { params: finalParams });
        return response.data;
    }

    // Registrar usuario admin para una empresa o sucursal
    async registerAdminUser(data) {
        const response = await axiosInstance.post('/users/register-admin', data);
        return response.data;
    }

    // Obtener usuarios asignados a una empresa o sucursal específica
    async getUsersByCompany(companyId) {
        const response = await axiosInstance.get(`/users/company/${companyId}`);
        return response.data;
    }

    // Todo el staff del tenant (super_admin, administradores, empleados de todas las sucursales)
    async getTenantStaff(companyId) {
        const response = await axiosInstance.get(`/users/tenant-staff/${companyId}`);
        return response.data;
    }
}

// Export singleton instance
export default new UserService();