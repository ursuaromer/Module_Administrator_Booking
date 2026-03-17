import axiosInstance from '../../../shared/utils/axiosInstance';

/**
 * Servicio para la gestión de reservas en el panel de administrador.
 */
const bookingService = {
    /**
     * Obtiene las reservas por espacio y fecha (para un día específico).
     * @param {string|number} spaceId - ID del espacio
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @returns {Promise<Object>}
     */
    getBookingsBySpace: async (spaceId, date) => {
        const response = await axiosInstance.get('/reservations/by-space', {
            params: { space_id: spaceId, date }
        });
        return response.data;
    },

    /**
     * Obtiene reservas para un rango de fechas (por ejemplo, para la vista semanal).
     * @param {string|number} spaceId - ID del espacio
     * @param {string} startDate - Fecha inicio YYYY-MM-DD
     * @param {string} endDate - Fecha fin YYYY-MM-DD
     * @returns {Promise<Object>}
     */
    getBookingsRange: async (spaceId, startDate, endDate) => {
        const response = await axiosInstance.get('/reservations/range', {
            params: { space_id: spaceId, start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    /**
     * Crea una nueva reserva desde el panel admin.
     * @param {Object} reservationData 
     */
    createReservation: async (reservationData) => {
        const response = await axiosInstance.post('/reservations', reservationData);
        return response.data;
    },

    /**
     * Obtiene todas las reservas de una sucursal con paginación (panel admin).
     * @param {number} subsidiaryId
     * @param {{ page?, limit?, status? }} params
     */
    getBookingsBySubsidiary: async (subsidiaryId, { page = 1, limit = 20, status = '', startDate = null, endDate = null } = {}) => {
        const response = await axiosInstance.get('/reservations/by-subsidiary', {
            params: {
                subsidiary_id: subsidiaryId,
                page,
                limit,
                ...(status && { status }),
                ...(startDate && { start_date: startDate }),
                ...(endDate && { end_date: endDate }),
            }
        });
        return response.data;
    },

    getPaymentsBySubsidiary: async (subsidiaryId, { page = 1, limit = 20, status = '', startDate = null, endDate = null } = {}) => {
        const response = await axiosInstance.get('/reservations/payments-by-subsidiary', {
            params: {
                subsidiary_id: subsidiaryId,
                page,
                limit,
                ...(status && { status }),
                ...(startDate && { start_date: startDate }),
                ...(endDate && { end_date: endDate }),
            }
        });
        return response.data;
    },

    /**
     * Cancela una reserva.
     * @param {string|number} bookingId
     */
    cancelReservation: async (bookingId) => {
        const response = await axiosInstance.delete(`/reservations/${bookingId}`);
        return response.data;
    },

    /**
     * Confirma el pago de una reserva PENDING (YAPE/PLIN/CASH/BANK_TRANSFER).
     * @param {string|number} bookingId
     * @param {string} [receiptNumber]
     */
    confirmPayment: async (bookingId, receiptNumber = null) => {
        const response = await axiosInstance.put(`/reservations/${bookingId}/confirm-cash`, {
            receipt_number: receiptNumber
        });
        return response.data;
    },

    /**
     * Confirma una reserva individual de un paquete.
     */
    confirmIndividual: async (bookingId) => {
        const response = await axiosInstance.put(`/reservations/${bookingId}/confirm-individual`);
        return response.data;
    },

    /**
     * Rechaza una reserva individual de un paquete.
     */
    rejectIndividual: async (bookingId, reason = null) => {
        const response = await axiosInstance.put(`/reservations/${bookingId}/reject-individual`, { reason });
        return response.data;
    },

    /**
     * Confirma todas las reservas de un paquete de pago.
     */
    confirmAllPayment: async (paymentId) => {
        const response = await axiosInstance.put(`/reservations/payment/${paymentId}/confirm-all`);
        return response.data;
    },

    /**
     * Rechaza todas las reservas de un paquete de pago (Pago fallido).
     */
    rejectAllPayment: async (paymentId, reason = null) => {
        const response = await axiosInstance.put(`/reservations/payment/${paymentId}/reject-all`, { reason });
        return response.data;
    },

    /**
     * Rechaza (cancela) una reserva PENDING individual.
     */
    rejectPayment: async (bookingId, reason = null) => {
        const response = await axiosInstance.put(`/reservations/${bookingId}/reject`, {
            rejection_reason: reason
        });
        return response.data;
    }
};

export default bookingService;
