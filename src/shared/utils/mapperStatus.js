/**
 * Mapeador de estados de reserva (ENUMs) a etiquetas legibles por humanos.
 */
export const bookingStatusMapper = {
    'PENDING': {
        label: 'PENDIENTE DE CONFIRMACIÓN',
        color: '#ca8a04',
        bgColor: '#fef9c3',
        className: 'pending'
    },
    'CONFIRMED': {
        label: 'CONFIRMADA',
        color: '#166534',
        bgColor: '#dcfce7',
        className: 'confirmed'
    },
    'CANCELED': {
        label: 'CANCELADA',
        color: '#991b1b',
        bgColor: '#fee2e2',
        className: 'canceled'
    },
    'COMPLETED': {
        label: 'COMPLETADA',
        color: '#1e293b',
        bgColor: '#f1f5f9',
        className: 'completed'
    },
    'NO_SHOW': {
        label: 'NO ASISTIÓ',
        color: '#475569',
        bgColor: '#f8fafc',
        className: 'no-show'
    },
    'REJECTED': {
        label: 'RECHAZADA (ADMIN)',
        color: '#991b1b',
        bgColor: '#fdf2f2',
        className: 'rejected'
    }
};

/**
 * Mapeador de estados de pago.
 */
export const paymentStatusMapper = {
    'PENDING': {
        label: 'PENDIENTE',
        className: 'pending'
    },
    'AWAITING_APPROVAL': {
        label: 'POR APROBAR',
        className: 'awaiting_approval'
    },
    'PAID': {
        label: 'PAGADO',
        className: 'paid'
    },
    'REFUNDED': {
        label: 'REMBOLSADO',
        className: 'refunded'
    },
    'CANCELLED': {
        label: 'CANCELADO',
        className: 'cancelled'
    },
    'FAILED': {
        label: 'FALLIDO/RECHAZADO',
        className: 'failed'
    }
};

/**
 * Obtiene la etiqueta legible de un estado.
 * @param {string} status 
 * @returns {string}
 */
export const getStatusLabel = (status) => {
    const s = String(status).toUpperCase();
    return bookingStatusMapper[s]?.label || status;
};

/**
 * Obtiene la etiqueta legible de un estado de pago.
 */
export const getPaymentStatusLabel = (status) => {
    const s = String(status).toUpperCase();
    return paymentStatusMapper[s]?.label || status;
};

/**
 * Obtiene el color de un estado.
 * @param {string} status 
 * @returns {string}
 */
export const getStatusColor = (status) => {
    const s = String(status).toUpperCase();
    return bookingStatusMapper[s]?.color || '#000';
};
