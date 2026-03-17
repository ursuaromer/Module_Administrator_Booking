import axiosInstance from '../../../shared/utils/axiosInstance';

/**
 * Servicio para la gestión de la configuración de compañías y sucursales
 */
class ConfigurationService {
    /**
     * Obtener configuración completa por ID de compañía/sucursal
     */
    async getConfiguration(companyId) {
        const response = await axiosInstance.get(`/companies/config/${companyId}`);
        return response.data;
    }

    /**
     * Guardar configuración (acepta FormData para subir imágenes: logo, banner, yape_qr, plin_qr)
     */
    async saveConfiguration(companyId, configData) {
        const response = await axiosInstance.post(`/companies/config/${companyId}`, configData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    /**
     * Obtener solo la configuración de pagos de una sucursal (para el checkout de reservas)
     * Endpoint público: GET /companies/public/subsidiaries/:id/payment-config
     */
    async getPaymentConfig(sucursalId) {
        const response = await axiosInstance.get(`/companies/public/subsidiaries/${sucursalId}/payment-config`);
        return response.data;
    }

    /**
     * Eliminar una imagen de configuración (logo | yape_qr | plin_qr).
     * Borra de Media (físico + BD) y limpia la URL espejo en Configuration.
     *
     * @param {number|string} companyId
     * @param {'logo'|'yape_qr'|'plin_qr'} mediaField
     */
    async deleteConfigMedia(companyId, mediaField) {
        const response = await axiosInstance.delete(
            `/companies/config/${companyId}/media/${mediaField}`
        );
        return response.data;
    }

    /**
     * Guardar métodos de pago activos para una sucursal
     */
    async saveActivePayments(sucursalId, paymentMethods) {
        const response = await axiosInstance.post('/companies/payments-active', {
            sucursal_id: sucursalId,
            payment_methods: paymentMethods
        });
        return response.data;
    }

    /**
     * Actualizar el orden de los métodos de pago
     */
    async updatePaymentOrder(sucursalId, orderedPayments) {
        const response = await axiosInstance.post('/companies/payments-order', {
            sucursal_id: sucursalId,
            ordered_payments: orderedPayments
        });
        return response.data;
    }
}

export default new ConfigurationService();
