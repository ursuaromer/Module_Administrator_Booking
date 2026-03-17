import { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { LuListTodo } from 'react-icons/lu';
import { FaUser } from 'react-icons/fa';
import bookingService from '../services/bookingService';
import { getPaymentStatusLabel } from '../../../shared/utils/mapperStatus';
import { LoadingScreen } from '../../../shared/components';
import '../styles/BookingTable.css';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'PAID', label: 'Pagados' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'AWAITING_APPROVAL', label: 'Por aprobar' },
    { value: 'FAILED', label: 'Fallidos' },
    { value: 'CANCELED', label: 'Cancelados' },
];

const fmtDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fmtMoney = (n) => `S/ ${Number(n || 0).toFixed(2)}`;

const getMethodLabel = (payment) => {
    if (payment.payment_gateway) return payment.payment_gateway.toUpperCase();
    return payment.method === 'IN_PERSON' ? 'EFECTIVO' : 'ONLINE';
};

const getDateRange = (bookings) => {
    if (!bookings?.length) return '—';
    const dates = bookings.map(b => b.booking_date).sort();
    if (dates[0] === dates[dates.length - 1]) return dates[0];
    return `${dates[0]} → ${dates[dates.length - 1]}`;
};

const getUniqueSpaces = (bookings) => {
    if (!bookings?.length) return '—';
    const names = [...new Set(bookings.map(b => b.space?.name).filter(Boolean))];
    return names.join(', ') || '—';
};

const BookingTable = ({ subsidiaryId, onSelectReservation, mesActual }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

    const fetchData = useCallback(async () => {
        if (!subsidiaryId) return;
        setLoading(true);
        try {
            const ref = mesActual || new Date();
            const startDate = fmtDate(new Date(ref.getFullYear(), ref.getMonth(), 1));
            const endDate   = fmtDate(new Date(ref.getFullYear(), ref.getMonth() + 1, 0));

            const payload = await bookingService.getPaymentsBySubsidiary(subsidiaryId, {
                page,
                limit: PAGE_SIZE,
                status: statusFilter,
                startDate,
                endDate,
            });
            const data = payload.data;
            setPayments(data.payments || []);
            setTotal(data.total || 0);
            setTotalPages(data.totalPages || 1);
            setTotalPaid(data.totalPaid || 0);
            setTotalPending(data.totalPending || 0);
        } catch {
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, [subsidiaryId, page, statusFilter, mesActual]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => { setPage(1); }, [mesActual]);

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        setPage(1);
    };

    const handleViewPayment = (payment) => {
        if (!onSelectReservation) return;
        const firstBooking = payment.bookings?.[0];
        const user = firstBooking?.user;
        const clientName = user
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
            : 'Cliente externo';

        onSelectReservation(prev =>
            prev?.id === payment.payment_id ? null : {
                id: payment.payment_id,
                cliente: clientName,
                email: user?.email || '',
                telefono: user?.person?.phone || '',
                fecha: firstBooking?.booking_date,
                horaInicio: firstBooking?.start_time?.slice(0, 5),
                horaFin: firstBooking?.end_time?.slice(0, 5),
                estado: firstBooking?.status?.toLowerCase(),
                isHold: false,
                raw: {
                    ...(firstBooking || {}),
                    payment: {
                        payment_id: payment.payment_id,
                        status: payment.status,
                        amount: payment.amount,
                        method: payment.method,
                        payment_gateway: payment.payment_gateway,
                        payment_proof_url: payment.payment_proof_url,
                        scheduled_payment_date: payment.scheduled_payment_date,
                        scheduled_payment_time: payment.scheduled_payment_time,
                        contact_phone: payment.contact_phone,
                        bookings: payment.bookings,
                    },
                },
            }
        );
    };

    const countStats = [
        { label: 'Total pagos', value: total },
        { label: 'Pagados', value: payments.filter(p => p.status === 'PAID').length },
        { label: 'Pendientes', value: payments.filter(p => p.status === 'PENDING' || p.status === 'AWAITING_APPROVAL').length },
        { label: 'Fallidos', value: payments.filter(p => p.status === 'FAILED' || p.status === 'CANCELED').length },
    ];

    const moneyStats = [
        { label: 'Cobrado', value: fmtMoney(totalPaid), color: '#16a34a' },
        { label: 'Por cobrar', value: fmtMoney(totalPending), color: '#d97706' },
    ];

    return (
        <div className='adm-table_reservas'>
            {/* Header */}
            <section className='section-header'>
                <div className='header-content'>
                    <h1>Pagos y Reservas</h1>
                    <p>{(mesActual || new Date()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className='header-actions'>
                    <button className='btn-secondary'><FiDownload /> Exportar</button>
                </div>
            </section>

            {/* Stats */}
            <div className='quick-stats'>
                {countStats.map(s => (
                    <div key={s.label} className='stat-item'>
                        <span className='stat-number'>{s.value}</span>
                        <span className='stat-label'>{s.label}</span>
                    </div>
                ))}
                {moneyStats.map(s => (
                    <div key={s.label} className='stat-item stat-item--money'>
                        <span className='stat-number' style={{ color: s.color }}>{s.value}</span>
                        <span className='stat-label'>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Tabla */}
            <div className='reservations-table'>
                <div className='table-header'>
                    <h3><LuListTodo /> Lista de Pagos</h3>
                    <span className='results-count'>{total} pagos encontrados</span>
                    <select
                        className='status-filter'
                        value={statusFilter}
                        onChange={e => handleStatusChange(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div className='table-body-wrapper'>
                    {loading ? (
                        <LoadingScreen size='sm' message='Cargando pagos...' />
                    ) : payments.length === 0 ? (
                        <div className='table-empty'>
                            <p>No hay pagos{statusFilter ? ` con estado "${STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}"` : ''} en este período.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    <th>Espacio(s)</th>
                                    <th>Fechas</th>
                                    <th>Reservas</th>
                                    <th>Método</th>
                                    <th>Total</th>
                                    <th>Estado pago</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p, idx) => {
                                    const firstBooking = p.bookings?.[0];
                                    const user = firstBooking?.user;
                                    const clientName = user
                                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                        : 'Cliente externo';
                                    const clientEmail = user?.email || '';

                                    return (
                                        <tr key={p.payment_id} className={`row-status-${p.status?.toLowerCase()}`}>
                                            <td className='reservation-id'>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                            <td>
                                                <div className='client-info'>
                                                    <FaUser className='client-avatar' />
                                                    <div className='client-details'>
                                                        <span className='client-name'>{clientName}</span>
                                                        {clientEmail && <span className='client-email'>{clientEmail}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='space-cell'>{getUniqueSpaces(p.bookings)}</td>
                                            <td className='date-cell'>{getDateRange(p.bookings)}</td>
                                            <td>
                                                <span className='bookings-count'>{p.bookings?.length || 0}</span>
                                            </td>
                                            <td>
                                                <span className='method-badge'>{getMethodLabel(p)}</span>
                                            </td>
                                            <td className='price'>{fmtMoney(p.amount)}</td>
                                            <td>
                                                <span className={`payment-status ${p.status?.toLowerCase()}`}>
                                                    {getPaymentStatusLabel(p.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className='actions'>
                                                    <button
                                                        className='action-btn view'
                                                        title='Ver reservas'
                                                        onClick={() => handleViewPayment(p)}
                                                    >
                                                        <FiEye />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Paginación */}
                <div className='pagination'>
                    <button
                        className='pagination-btn'
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 1 || loading}
                    >
                        <FiChevronLeft /> Anterior
                    </button>
                    <span className='pagination-info'>Página {page} de {totalPages}</span>
                    <button
                        className='pagination-btn'
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages || loading}
                    >
                        Siguiente <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingTable;
