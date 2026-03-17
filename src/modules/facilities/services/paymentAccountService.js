import axiosInstance from '../../../shared/utils/axiosInstance';

class PaymentAccountService {
    // Obtener todas las cuentas de pago de una sucursal
    async getBySucursal(sucursalId) {
        const response = await axiosInstance.get(`/companies/payment-accounts/sucursal/${sucursalId}`);
        return response.data;
    }

    // Obtener cuentas filtradas por tipo de pago
    async getByType(sucursalId, paymentTypeId) {
        const response = await axiosInstance.get(`/companies/payment-accounts/sucursal/${sucursalId}/type/${paymentTypeId}`);
        return response.data;
    }

    // Crear cuenta de pago
    async create(data) {
        const response = await axiosInstance.post('/companies/payment-accounts', data);
        return response.data;
    }

    // Actualizar cuenta de pago
    async update(id, data) {
        const response = await axiosInstance.put(`/companies/payment-accounts/${id}`, data);
        return response.data;
    }

    // Eliminar (soft) cuenta de pago
    async delete(id) {
        const response = await axiosInstance.delete(`/companies/payment-accounts/${id}`);
        return response.data;
    }
}

export default new PaymentAccountService();
