import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Calendar as CalendarIcon, X } from 'lucide-react';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { FaUser, FaCheckCircle, FaTimesCircle, FaCheck, FaTimes } from 'react-icons/fa';
import { CiMenuKebab, CiSearch } from 'react-icons/ci';
import { GoGear } from 'react-icons/go';
import { GrCircleQuestion } from 'react-icons/gr';
import { CgArrowsExchangeV } from 'react-icons/cg';
import useBookingReservation from '../hooks/useBookingReservation';
import useBookingSocket from '../../../shared/hooks/useSocket';
import BookingCalendar from '../components/BookingCalendar';
import BookingTable from '../components/BookingTable';
import ModalBookingForm from '../components/ModalBookingForm';
import { LoadingScreen, ErrorScreen, Button, Modal } from '../../../shared/components';
import { getImageUrl } from '../../../shared/utils/formarText';
import { getStatusLabel, getPaymentStatusLabel } from '../../../shared/utils/mapperStatus';
import bookingService from '../services/bookingService';
import toast from 'react-hot-toast';

import '../styles/Bookings.css';

/**
 * Vista de Calendario de Reservas.
 * Unificada: Maneja lógica, sidebar y calendario en una sola página.
 */
const Bookings = () => {
    const { subsidiaryId } = useParams();
    const navigate = useNavigate();

    const {
        // Jerarquía
        selectedCompany,
        selectedSubsidiary,
        subsidiaries,
        loadingSubsidiaries,
        handleSelectSubsidiary,
        loadHierarchyData,

        // Calendario
        openMenus,
        mesActual,
        fechaSeleccionadaCalendario,
        semanaSeleccionada,
        generarDiasCalendario,
        navegarMes,
        obtenerNombreMes,
        obtenerNombresDias,
        manejarSeleccionFecha,
        obtenerFechasDinamicas,
        handleClickOpenMenu,
        toggleContent,
        handleToggleViewReserva,
        vistaReseva,
        handleToggleView,
        tipoVista,
        handleSelectSport,
        deporteSeleccionado,
        selectReservation,
        setSelectReservation,
        handleClickReserva,

        // Nueva Reserva
        showModalNewBooking,
        setShowModalNewBooking,
        initialBookingData,
        creatingBooking,
        handleOpenNewBooking,
        handleCreateBooking,

        // Reservas Reales
        reservas,
        loadingReservas,
        loadReservations,

        invalidSubsidiary,
    } = useBookingReservation();

    const filtersRef = useRef(null);
    const leyendsRef = useRef(null);
    const [confirmingPayment, setConfirmingPayment] = useState(false);

    const handleConfirmPayment = async () => {
        if (!selectReservation?.id) return;
        setConfirmingPayment(true);
        try {
            await bookingService.confirmPayment(selectReservation.id);
            toast.success('Pago confirmado. Reserva activa.');
            setSelectReservation(null);
            loadReservations();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error al confirmar el pago');
        } finally {
            setConfirmingPayment(false);
        }
    };


    const handleConfirmIndividual = async (bookingId) => {
        setConfirmingPayment(true);
        try {
            await bookingService.confirmIndividual(bookingId);
            toast.success('Reserva horaria confirmada.');
            // Recargar datos para ver cambios en los estados individuales
            loadReservations();

            // Actualizar el estado local para reflejar el cambio en el modal si sigue abierto
            if (selectReservation?.raw?.payment?.bookings) {
                const updatedBookings = selectReservation.raw.payment.bookings.map(b =>
                    b.booking_id === bookingId ? { ...b, status: 'CONFIRMED' } : b
                );

                // Si todas están confirmadas, el botón global ya no aparecerá o el estado cambiará
                setSelectReservation({
                    ...selectReservation,
                    raw: {
                        ...selectReservation.raw,
                        payment: {
                            ...selectReservation.raw.payment,
                            bookings: updatedBookings
                        }
                    }
                });
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error al confirmar reserva');
        } finally {
            setConfirmingPayment(false);
        }
    };

    const handleConfirmAll = async () => {
        const paymentId = selectReservation.raw?.payment?.payment_id;
        if (!paymentId) return;

        setConfirmingPayment(true);
        try {
            await bookingService.confirmAllPayment(paymentId);
            toast.success('Todas las reservas del pago confirmadas.');
            setSelectReservation(null);
            loadReservations();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error al confirmar todas las reservas');
        } finally {
            setConfirmingPayment(false);
        }
    };

    const handleRejectAll = async () => {
        const paymentId = selectReservation.raw?.payment?.payment_id;
        if (!paymentId) return;

        const reason = window.prompt('Motivo del rechazo masivo (opcional):');
        if (reason === null) return;

        setConfirmingPayment(true);
        try {
            await bookingService.rejectAllPayment(paymentId, reason);
            toast.success('Todas las reservas han sido rechazadas.');
            setSelectReservation(null);
            loadReservations();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error al rechazar reservas');
        } finally {
            setConfirmingPayment(false);
        }
    };

    const handleRejectIndividual = async (bookingId) => {
        const reason = window.prompt('Motivo del rechazo (opcional):');
        if (reason === null) return;

        setConfirmingPayment(true);
        try {
            await bookingService.rejectIndividual(bookingId, reason);
            toast.success('Reserva rechazada.');

            // Actualizar localmente si el modal sigue abierto
            if (selectReservation?.raw?.payment?.bookings) {
                const updatedBookings = selectReservation.raw.payment.bookings.map(b =>
                    b.booking_id === bookingId ? { ...b, status: 'REJECTED' } : b
                );

                // Recalcular el monto total basándose en las reservas no rechazadas/canceladas
                const newTotal = updatedBookings
                    .filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED')
                    .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

                // Si ya no quedan activas, cerramos el detalle (pago falló)
                const hasActives = updatedBookings.some(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
                if (!hasActives) {
                    setSelectReservation(null);
                } else {
                    setSelectReservation({
                        ...selectReservation,
                        raw: {
                            ...selectReservation.raw,
                            payment: {
                                ...selectReservation.raw.payment,
                                bookings: updatedBookings,
                                amount: newTotal
                            }
                        }
                    });
                }
            }
            loadReservations();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Error al rechazar reserva');
        } finally {
            setConfirmingPayment(false);
        }
    };

    // Cargar datos iniciales basados solo en el ID de la sucursal
    useEffect(() => {
        if (subsidiaryId) {
            loadHierarchyData(subsidiaryId);
        }
    }, [subsidiaryId, loadHierarchyData]);

    // Seleccionar sucursal una vez cargadas
    useEffect(() => {
        if (subsidiaryId && subsidiaries.length > 0) {
            handleSelectSubsidiary(subsidiaryId);
        }
    }, [subsidiaryId, subsidiaries, handleSelectSubsidiary]);

    // --- Integración de Socket.io ---
    const activeDates = useMemo(() => {
        return obtenerFechasDinamicas().map(f => {
            const año = f.getFullYear();
            const mes = (f.getMonth() + 1).toString().padStart(2, '0');
            const dia = f.getDate().toString().padStart(2, '0');
            return `${año}-${mes}-${dia}`;
        });
    }, [obtenerFechasDinamicas]);

    const { subscribe } = useBookingSocket(deporteSeleccionado, activeDates);

    useEffect(() => {
        if (!deporteSeleccionado) return;

        // --- Eventos de Reservas Confirmadas ---
        subscribe('booking:confirmed', (data) => {
            console.log('🚀 Reserva confirmada vía socket:', data);
            loadReservations();
        });

        subscribe('booking:created', (data) => {
            console.log('🚀 Nueva reserva creada:', data);
            loadReservations();
        });

        subscribe('booking:cancelled', (data) => {
            console.log('🚀 Reserva cancelada:', data);
            loadReservations();
        });

        // --- Eventos de Bloqueo Temporal (Holds) coincidiendo con el Backend ---
        subscribe('booking:hold_created', (data) => {
            console.log('⏳ Nuevo hold (bloqueo) creado vía socket:', data);
            loadReservations(); // Recargar para ver el nuevo hold
        });

        subscribe('booking:released', (data) => {
            console.log('⏳ Hold liberado/cancelado vía socket:', data);
            loadReservations(); // Recargar para quitar el hold
        });

        subscribe('booking:hold_expired', (data) => {
            console.log('⏳ Hold expirado vía socket:', data);
            loadReservations(); // Recargar para limpiar expirados
        });
    }, [deporteSeleccionado, subscribe, loadReservations]);

    const handleToggle = (type) => {
        const ref = type === 'filters' ? filtersRef : leyendsRef;
        handleClickOpenMenu(type);
        if (ref.current) toggleContent(ref.current);
    };

    if (loadingSubsidiaries && !selectedCompany) {
        return <LoadingScreen message="Cargando configuración del calendario..." />;
    }

    if (invalidSubsidiary) {
        return <ErrorScreen variant='forbidden' message="Datos proporcionados no corresponde a una sucursal." onBack={() => navigate('/bookings')} />;
    }

    if (!selectedCompany) {
        return <ErrorScreen message="No se pudo encontrar la información de la sucursal." />;
    }

    // Horarios de la sucursal seleccionada
    const instalacionConfig = {
        open_time: selectedSubsidiary?.opening_time || '08:00',
        close_time: selectedSubsidiary?.closing_time || '22:00'
    };

    return (
        <div className='view_bookings'>
            {/* ── Topbar ─────────────────────────────────────────── */}
            <header className='bookings-topbar'>
                <div className='topbar__left'>
                    <h1 className='topbar_title center'>
                        <CalendarIcon size={20} />
                        Reservas: {selectedSubsidiary?.name || 'Cargando...'}
                    </h1>
                    <p className='subsidiary-subinfo'>
                        <Building2 size={12} /> {selectedCompany.name}
                        {selectedSubsidiary && (
                            <>
                                <span className='separator'>•</span>
                                <MapPin size={12} /> {selectedSubsidiary.address}
                            </>
                        )}
                    </p>
                </div>

                <div className='topbar__right'>
                    <Button variant='cancel' text='Volver' Icon={X} iconLeft onClick={() => navigate('/bookings')} />
                </div>
            </header>

            {/* ── Cuerpo Unificado (Sidebar + Main) ──────────────── */}
            <div className='adm-reservations'>
                {/* Barra lateral */}
                <aside className='menu_lateral'>
                    <div>
                        <section className='header_lateral'>
                            <div>
                                <h4>{vistaReseva === 1 ? 'Vista Calendario' : 'Vista Tabla'}</h4>
                                <p>Administra reservas</p>
                            </div>
                            <CgArrowsExchangeV
                                className='ico_cambio_vista'
                                onClick={handleToggleViewReserva}
                                title='Cambiar vista'
                            />
                        </section>

                        {/* Mini calendario */}
                        <section className='calendars'>
                            <div className='calendar-navigation'>
                                <h3>{obtenerNombreMes(mesActual)} {mesActual.getFullYear()}</h3>
                                <IoIosArrowBack onClick={() => navegarMes(-1)} />
                                <IoIosArrowForward onClick={() => navegarMes(1)} />
                            </div>
                            <div className='calendar-days-header'>
                                {obtenerNombresDias().map(dia => (
                                    <div key={dia} className='day-header'>{dia}</div>
                                ))}
                            </div>
                            <div className='calendar_days_body'>
                                {(() => {
                                    const dias = generarDiasCalendario();
                                    const filas = [];
                                    for (let i = 0; i < dias.length; i += 7) {
                                        const semana = dias.slice(i, i + 7);
                                        const semanaActiva = semana.some(d => d.esDeLaSemanaSeleccionada);
                                        filas.push(
                                            <div key={`sem-${i}`} className={`calendar-week ${semanaActiva ? 'week-row-selected' : ''}`}>
                                                {semana.map((dia, idx) => (
                                                    <div
                                                        key={`${i}-${idx}`}
                                                        className={`calendar-day
                                                                ${dia.esMesAnterior ? 'previous-month' : ''}
                                                                ${dia.esMesSiguiente ? 'next-month' : ''}
                                                                ${dia.esSeleccionada ? 'selected' : dia.esHoy ? 'today' : ''}
                                                                ${dia.esDeLaSemanaSeleccionada ? 'week-selected' : ''}
                                                            `}
                                                        onClick={() => manejarSeleccionFecha(dia.fecha)}
                                                    >
                                                        {dia.numero}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return filas;
                                })()}
                            </div>
                        </section>

                        {/* Filtros */}
                        <section className='filters'>
                            <button
                                className={`btn_expand_menus ${openMenus.filters ? 'expanded' : ''}`}
                                onClick={() => handleToggle('filters')}
                            >
                                Filtros
                                <IoIosArrowForward className={`${openMenus.filters ? 'rotated' : ''}`} />
                            </button>
                            <div ref={filtersRef} className={`filter ${openMenus.filters ? 'filter_expanded' : ''}`}>
                                <label><input type="checkbox" /> Confirmadas</label>
                                <label><input type="checkbox" /> Pendientes</label>
                                <label><input type="checkbox" /> Canceladas</label>
                                <label><input type="checkbox" /> Completadas</label>
                                <label><input type="checkbox" /> No Completadas</label>
                            </div>
                        </section>

                        <section className='leyends'>
                            <button
                                className={`btn_expand_menus ${openMenus.leyends ? 'expanded' : ''}`}
                                onClick={() => handleToggle('leyends')}
                            >
                                Leyenda
                                <IoIosArrowForward className={`${openMenus.leyends ? 'rotated' : ''}`} />
                            </button>
                            <div ref={leyendsRef} className={`leyend ${openMenus.leyends ? 'leyend_expanded' : ''}`}>
                                <label style={{ color: '#44a37a' }}>● Confirmada</label>
                                <label style={{ color: '#e6a817' }}>● Pendiente</label>
                                <label style={{ color: '#f05f5f' }}>● Cancelada</label>
                            </div>
                        </section>
                    </div>

                    <div className='footer_lateral'>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <FaUser style={{ background: '#667eea', color: 'white', borderRadius: '50%', padding: 4, width: 22, height: 22 }} />
                            <FaUser style={{ background: '#667eea', color: 'white', borderRadius: '50%', padding: 4, width: 22, height: 22 }} />
                        </div>
                        <CiMenuKebab style={{ fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }} />
                    </div>
                </aside>

                {/* Main */}
                <main className='reservation_main'>
                    <header className='header_main'>
                        <h4>{obtenerNombreMes(mesActual)} {mesActual.getFullYear()}</h4>
                        <div className='header_accions'>
                            <aside className='svgs'>
                                <CiSearch strokeWidth={1.5} />
                                <GrCircleQuestion />
                                <GoGear strokeWidth={1} />
                            </aside>
                            <div className='line' />
                            <aside className='btns'>
                                {selectedSubsidiary?.spaces?.map((space) => (
                                    <button
                                        key={space.space_id}
                                        className={deporteSeleccionado === space.space_id ? 'active_sport' : ''}
                                        onClick={() => handleSelectSport(space.space_id)}
                                    >
                                        {space.name}
                                    </button>
                                ))}
                                {(!selectedSubsidiary?.spaces || selectedSubsidiary.spaces.length === 0) && (
                                    <span className='no-spaces-msg'>Sin espacios</span>
                                )}
                            </aside>
                            <div className='line' />
                            <aside className='btns'>
                                <button className={tipoVista === 'day' ? 'active_view' : ''} onClick={() => handleToggleView('day')}>Día</button>
                                <button className={tipoVista === 'week' ? 'active_view' : ''} onClick={() => handleToggleView('week')}>Semana</button>
                                <button className={tipoVista === 'month' ? 'active_view' : ''} onClick={() => handleToggleView('month')}>Mes</button>
                            </aside>
                        </div>
                    </header>

                    <section className='content_main'>
                        {vistaReseva === 1 ? (
                            <BookingCalendar
                                fechaInicio={obtenerFechasDinamicas()[0]}
                                fechaFin={obtenerFechasDinamicas()[obtenerFechasDinamicas().length - 1]}
                                fechaSeleccionada={fechaSeleccionadaCalendario}
                                tipoVista={tipoVista}
                                selectReservation={selectReservation}
                                handleClickReserva={handleClickReserva}
                                onSlotClick={handleOpenNewBooking}
                                reservas={reservas}
                                loading={loadingReservas}
                                instalacion={instalacionConfig}
                            />
                        ) : (
                            <BookingTable
                                subsidiaryId={selectedSubsidiary?.company_id}
                                onSelectReservation={setSelectReservation}
                                mesActual={mesActual}
                            />
                        )}
                    </section>
                </main>

                {/* Detalle de Reserva (Modal Lateral) */}
                {selectReservation && (
                    <aside className='details_block_reservation' onClick={e => e.stopPropagation()}>
                        <div className='header_details'>
                            <FaUser />
                            <h4>Detalle de Reserva</h4>
                        </div>
                        <div className='body_details'>
                            <div className='detail-item'>
                                <label>Cliente:</label>
                                <p>{selectReservation.cliente}</p>
                            </div>
                            <aside className='data_row'>
                                {selectReservation.telefono && (
                                    <div className='detail-item'>
                                        <label>Teléfono:</label>
                                        <p>{selectReservation.telefono}</p>
                                    </div>
                                )}
                                {selectReservation.email && (
                                    <div className='detail-item'>
                                        <label>Email:</label>
                                        <p>{selectReservation.email}</p>
                                    </div>
                                )}
                            </aside>
                            <div className='detail-item'>
                                <label>Horario:</label>
                                <p>{selectReservation.horaInicio} – {selectReservation.horaFin}</p>
                            </div>
                            <aside className='data_row'>
                                <div className='detail-item'>
                                    <label>Estado Reserva:</label>
                                    <p className={`status-badge ${selectReservation.estado}`}>
                                        {getStatusLabel(selectReservation.estado)}
                                    </p>
                                </div>
                                {selectReservation.raw?.payment && (
                                    <div className='detail-item'>
                                        <label>Estado Pago:</label>
                                        <p className={`status-badge payment-${selectReservation.raw.payment.status?.toLowerCase()}`}>
                                            {getPaymentStatusLabel(selectReservation.raw.payment.status)}
                                        </p>
                                    </div>
                                )}
                            </aside>
                            <aside className='data_row'>
                                {(selectReservation.raw?.payment?.payment_gateway || selectReservation.raw?.payment?.method) && (
                                    <div className='detail-item'>
                                        <label>Método de pago:</label>
                                        <p>{selectReservation.raw.payment.payment_gateway || selectReservation.raw.payment.method}</p>
                                    </div>
                                )}
                                {selectReservation.raw?.payment?.amount && (
                                    <div className='detail-item'>
                                        <label>Monto:</label>
                                        <p>S/ {Number(selectReservation.raw.payment.amount).toFixed(2)}</p>
                                    </div>
                                )}
                            </aside>
                            {selectReservation.raw?.payment?.method === 'IN_PERSON' && (
                                <div className='detail-item detail-item--cash-info'>
                                    <label>Cita de Pago (Efectivo):</label>
                                    <p className="cash-detail"><strong>📅 Fecha:</strong> {selectReservation.raw.payment.scheduled_payment_date}</p>
                                    <p className="cash-detail"><strong>🕒 Horario:</strong> {selectReservation.raw.payment.scheduled_payment_time}</p>
                                    <p className="cash-detail"><strong>📞 Contacto:</strong> {selectReservation.raw.payment.contact_phone}</p>
                                </div>
                            )}
                            {/* Otras reservas (horas) incluidas en este mismo pago */}
                            {selectReservation.raw?.payment?.bookings && selectReservation.raw.payment.bookings.length > 0 && (
                                <div className='detail-item detail-item--bookings-table'>
                                    <div className='title-with-btn'>
                                        <label>Reservas incluidas:</label>
                                        {(selectReservation.raw.payment.payment_gateway?.toUpperCase() === 'YAPE' || selectReservation.raw.payment.method === 'IN_PERSON') &&
                                            selectReservation.raw.payment.bookings.some(b => b.status === 'PENDING') && (
                                                <div className='bulk-actions'>
                                                    <Button text='Confirmar Todos' size='sm' disabled={confirmingPayment} onClick={handleConfirmAll} />
                                                    <Button text='Rechazar Todos' variant='danger' size='sm' disabled={confirmingPayment} onClick={handleRejectAll} />
                                                </div>
                                            )}
                                    </div>
                                    <div className='bookings-mini-table-container'>
                                        <table className='bookings-mini-table'>
                                            <thead>
                                                <tr>
                                                    <th>Fecha</th>
                                                    <th>Horario</th>
                                                    <th>Monto</th>
                                                    <th style={{ textAlign: 'center' }}>Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectReservation.raw.payment.bookings.map(b => (
                                                    <tr key={b.booking_id} className={`row-status-${b.status?.toLowerCase()}`}>
                                                        <td>
                                                            <div className='cell-date'>
                                                                <span>{b.booking_date}</span>
                                                                <span className={`badge-status-mini ${b.status?.toLowerCase()}`}>
                                                                    {getStatusLabel(b.status)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>{b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}</td>
                                                        <td>S/ {Number(b.total_amount).toFixed(2)}</td>
                                                        <td>
                                                            <div className='row-actions-icons'>
                                                                {b.status === 'PENDING' ? (
                                                                    <>
                                                                        <button
                                                                            className='action-icon confirm'
                                                                            onClick={() => handleConfirmIndividual(b.booking_id)}
                                                                            disabled={confirmingPayment}
                                                                            title="Confirmar"
                                                                        >
                                                                            <FaCheck />
                                                                        </button>
                                                                        <button
                                                                            className='action-icon reject'
                                                                            onClick={() => handleRejectIndividual(b.booking_id)}
                                                                            disabled={confirmingPayment}
                                                                            title="Rechazar"
                                                                        >
                                                                            <FaTimes />
                                                                        </button>
                                                                    </>
                                                                ) : b.status === 'CONFIRMED' ? (
                                                                    <FaCheckCircle className='status-icon confirmed' title="Confirmada" />
                                                                ) : (
                                                                    <FaTimesCircle className='status-icon rejected' title={getStatusLabel(b.status)} />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="2">TOTAL PAGO</td>
                                                    <td colSpan="2" className='total-price'>S/ {Number(selectReservation.raw.payment.amount).toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {/* Comprobante de pago */}
                            {selectReservation.raw?.payment?.payment_proof_url && (
                                <div className='detail-item detail-item--proof'>
                                    <label>Comprobante:</label>
                                    <a href={getImageUrl(selectReservation.raw.payment.payment_proof_url)} target="_blank" rel="noopener noreferrer">
                                        <img src={getImageUrl(selectReservation.raw.payment.payment_proof_url)} alt="Comprobante de pago" className='proof-thumbnail' />
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className='btns'>
                            <Button text='Cerrar' variant='cancel' onClick={() => setSelectReservation(null)} />
                            {((selectReservation.estado === 'pending' || selectReservation.estado === 'confirmed') &&
                                selectReservation.raw?.payment?.status !== 'PAID') && (
                                    <>
                                        <Button
                                            text='Confirmar Pago'
                                            variant='primary'
                                            loading={confirmingPayment}
                                            disabled={confirmingPayment}
                                            onClick={handleConfirmPayment}
                                        />
                                    </>
                                )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Modal para Nueva Reserva */}
            <Modal
                isOpen={showModalNewBooking}
                onClose={() => setShowModalNewBooking(false)}
                title="Nueva Reserva Administrativa"
                // size="large"
                headerColor="primary"
                Icon={CalendarIcon}
            >
                <ModalBookingForm
                    initialData={initialBookingData}
                    onClose={() => setShowModalNewBooking(false)}
                    onSave={handleCreateBooking}
                    loading={creatingBooking}
                />
            </Modal>
        </div>
    );
};

export default Bookings;
