import React, { useState, useRef, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import '../styles/BookingCalendar.css';

/**
 * Tabla dinámica de reservas (calendario visual).
 * Portada del componente DynamicTable del BOOKING_SPORT_FRONT,
 * adaptada con clases CSS del admin (sin dependencia del frontend).
 */
const BookingCalendar = ({
    fechaInicio,
    fechaFin,
    reservas = [],
    instalacion,
    fechaSeleccionada = null,
    tipoVista,
    selectReservation,
    handleClickReserva,
    onSlotClick, // Nueva prop para manejar clics en celdas vacías
}) => {
    const tableRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showGuides, setShowGuides] = useState(false);

    const handleTableClick = (e, fecha) => {
        // Evitar que el clic en un bloque de reserva dispare el clic en la tabla
        if (e.target.closest('.adm-dt-booking-block')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const hora = calcularHora(mouseY);

        if (hora && onSlotClick) {
            onSlotClick(fecha, hora);
        }
    };

    const generarFechasSemana = () => {
        const fechas = [];
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
            fechas.push(new Date(fecha));
        }
        return fechas;
    };

    const generarHorarios = () => {
        const [horaInicio] = instalacion.open_time.split(':').map(Number);
        const [horaFin] = instalacion.close_time.split(':').map(Number);
        const horarios = [];
        for (let h = horaInicio; h < horaFin; h++) {
            horarios.push({ tiempo: `${h.toString().padStart(2, '0')}:00` });
        }
        return horarios;
    };

    const handleMouseMove = (e) => {
        if (tableRef.current) {
            const rect = tableRef.current.getBoundingClientRect();
            setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const calcularHora = (mouseY) => {
        const headerEl = tableRef.current?.querySelector('.adm-dt-header');
        const bodyY = mouseY - (headerEl?.offsetHeight || 40);
        if (bodyY < 0) return null;
        const [horaInicio] = instalacion.open_time.split(':').map(Number);
        const [horaFin] = instalacion.close_time.split(':').map(Number);
        const timeCellEl = tableRef.current?.querySelector('.adm-dt-time-cell');
        const altPorHora = timeCellEl?.offsetHeight || 60;
        const celdaHora = Math.floor(bodyY / altPorHora);
        const posEnCelda = bodyY % altPorHora;
        let minutes = Math.floor((posEnCelda / altPorHora) * 60);
        let horaAbs = horaInicio + celdaHora;
        if (horaAbs >= horaFin) return `${horaFin.toString().padStart(2, '0')}:00`;
        return `${horaAbs.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const obtenerReservasPorFecha = (fecha) => {
        // Usar formato local YYYY-MM-DD para evitar desfases por zona horaria (UTC vs Local)
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        const fechaStr = `${año}-${mes}-${dia}`;

        return reservas.filter(r => r.fecha === fechaStr);
    };

    const calcularPosicion = (reserva) => {
        const [hInicio] = instalacion.open_time.split(':').map(Number);
        const [hFin] = instalacion.close_time.split(':').map(Number);
        const totalHoras = hFin - hInicio;

        if (totalHoras <= 0) return { posicionY: '0%', altura: '0%' };

        const [horaI, minI] = reserva.horaInicio.split(':').map(Number);
        const [horaF, minF] = reserva.horaFin.split(':').map(Number);

        const minutosDesdeInicio = (horaI - hInicio) * 60 + minI;
        const minutosDuracion = (horaF * 60 + minF) - (horaI * 60 + minI);
        const minutosTotales = totalHoras * 60;

        const posY = (minutosDesdeInicio / minutosTotales) * 100;
        const altura = (minutosDuracion / minutosTotales) * 100;

        return {
            posicionY: `${posY}%`,
            altura: `${Math.max(altura, 0.5)}%`
        };
    };

    const fechas = generarFechasSemana();
    const horarios = generarHorarios();

    return (
        <div
            className='adm-dyn-table-wrap'
            ref={tableRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setShowGuides(true)}
            onMouseLeave={() => setShowGuides(false)}
        >
            {/* Líneas guía */}
            {showGuides && (
                <>
                    <div className='adm-dt-guide-h' style={{ top: mousePosition.y }}>
                        {calcularHora(mousePosition.y) && (
                            <div className='adm-dt-guide-label'>
                                {calcularHora(mousePosition.y)}
                            </div>
                        )}
                    </div>
                    <div className='adm-dt-guide-v' style={{ left: mousePosition.x }} />
                </>
            )}

            {/* Header */}
            <div className='adm-dt-header'>
                <div className='adm-dt-col-time-header'>Hora</div>
                {fechas.map((fecha, idx) => {
                    const esSeleccionada = fechaSeleccionada && fecha.toDateString() === fechaSeleccionada.toDateString();
                    return (
                        <div key={idx} className={`adm-dt-col-date ${tipoVista === 'month' ? 'view-month' : ''}`}>
                            <span className='adm-dt-date-weekday'>
                                {fecha.toLocaleDateString('es-ES', { weekday: 'short' })}
                            </span>
                            <span className={`adm-dt-date-num ${esSeleccionada ? 'is-selected' : ''}`}>
                                {fecha.getDate()}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Cuerpo */}
            <div className='adm-dt-body'>
                {/* Columna de horarios */}
                <div className='adm-dt-col-time'>
                    {horarios.map((h, i) => (
                        <div key={i} className='adm-dt-time-cell'>
                            <span>{h.tiempo}</span>
                        </div>
                    ))}
                </div>

                {/* Columnas de fechas */}
                {fechas.map((fecha, colIdx) => {
                    const reservasFecha = obtenerReservasPorFecha(fecha);
                    return (
                        <div
                            key={colIdx}
                            className='adm-dt-col-day'
                            onClick={(e) => handleTableClick(e, fecha)}
                            style={{ cursor: 'crosshair' }} // Indica que se puede interactuar
                        >
                            {horarios.map((h, rowIdx) => (
                                <div key={rowIdx} className='adm-dt-row-hour' />
                            ))}
                            {reservasFecha.map((reserva, rIdx) => {
                                const pos = calcularPosicion(reserva);
                                const isSelected = selectReservation?.id === reserva.id;
                                const stateClass = `state-${reserva.estado}`;
                                const isPaymentPending = reserva.estado === 'confirmed' && reserva.raw?.payment?.status !== 'PAID';

                                return (
                                    <div
                                        key={rIdx}
                                        className={`adm-dt-booking-block ${stateClass} ${isSelected ? 'is-selected' : ''} ${isPaymentPending ? 'payment-pending' : ''}`}
                                        style={{
                                            top: pos.posicionY,
                                            height: pos.altura,
                                        }}
                                        onClick={() => handleClickReserva(reserva)}
                                    >
                                        <div className='adm-dt-block-header'>
                                            <FaUser className='adm-dt-block-avatar' />
                                            <span className='adm-dt-block-name'>{reserva.cliente}</span>
                                        </div>
                                        <div className='adm-dt-block-time'>
                                            {reserva.horaInicio} – {reserva.horaFin}
                                            {isPaymentPending && (
                                                <span className="payment-warning-icon" title="Pago pendiente"> ⚠️</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingCalendar;
