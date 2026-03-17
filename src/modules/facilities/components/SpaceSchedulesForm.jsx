import React from 'react';
import { Plus, Trash2, Clock, DollarSign, Copy, Check, AlertCircle, Calendar, X } from 'lucide-react';
import Button from '../../../shared/components/Buttons';
import { Switch } from '../../../shared/components';
import '../styles/scheduleForm.css';
import { useSpace, DAYS_OF_WEEK } from '../hooks/useSpace';

const SpaceSchedulesForm = ({ spaceId, spaceHook, setShowSchedulesModal }) => {
    // Si se pasa spaceHook desde el padre, usamos esa instancia para compartir estado.
    // De lo contrario, creamos una instancia local (fallback).
    const localHook = useSpace(spaceId);
    const hook = spaceHook || localHook;

    const {
        loading,
        loadingSchedules,
        schedules,
        activeDay,
        setActiveDay,
        copying,
        setCopying,
        handleAddTimeSlot,
        handleRemoveTimeSlot,
        handleUpdateField,
        handleCopySchedule,
        handleToggleDayStatus,
        handlePrepareAndSaveSchedules
    } = hook;

    // Determinar si el día actual está activo (si tiene al menos un turno que no esté cerrado)
    const isDayActive = schedules[activeDay]?.some(slot => !slot.is_closed);

    const handleCloseModal = () => {
        hook.getSpaceSchedules(spaceId);
        setShowSchedulesModal(false);
    };

    // Si schedules aún no está inicializado (objeto vacío), mostramos cargando o nada
    if (!schedules || Object.keys(schedules).length === 0) return null;

    return (
        <div className="modal_overlay">
            <div className="modal_content">
                {/* Encabezado */}
                <div className="modal_header">
                    <h3><Calendar size={20} /> Gestión de Horarios y Precios</h3>
                    <button className="close_modal_btn" onClick={handleCloseModal}>
                        <X size={20} />
                    </button>
                </div>
                {/* Cuerpo */}
                <div className="modal_body">
                    {/* Selectoresde dias */}
                    <div className="days_selector">
                        <button
                            className={`day_btn ${activeDay === 'SUMMARY' ? 'active' : ''}`}
                            onClick={() => setActiveDay('SUMMARY')}
                        >
                            Resumen
                        </button>
                        {DAYS_OF_WEEK.map(day => (
                            <button
                                key={day.value}
                                className={`day_btn ${activeDay === day.value ? 'active' : ''} ${schedules[day.value]?.length > 0 ? 'has_slots' : ''}`}
                                onClick={() => setActiveDay(day.value)}
                            >
                                {day.label}
                                {schedules[day.value]?.length > 0 && <span className="slot_count center">{schedules[day.value].length}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Editores */}
                    <div className="schedule_editor">
                        {activeDay === 'SUMMARY' ? (
                            <>
                                <div className="editor_header">
                                    <h4>Resumen Semanal de Disponibilidad</h4>
                                </div>
                                <div className="summary_list_container">
                                    <div className="summary_list_header">
                                        <span>Día</span>
                                        <span>Estado</span>
                                        <span>Turnos</span>
                                        <span>Acciones</span>
                                    </div>
                                    <div className="summary_list_body">
                                        {DAYS_OF_WEEK.map(day => {
                                            const daySlots = schedules[day.value] || [];
                                            const isCurrentlyActive = daySlots.length > 0 && daySlots.some(slot => !slot.is_closed);
                                            
                                            return (
                                                <div key={day.value} className="summary_list_item">
                                                    <div className="day_name_col">
                                                        <strong>{day.label}</strong>
                                                    </div>
                                                    <div className="status_toggle_col">
                                                        <Switch
                                                            checked={isCurrentlyActive}
                                                            onChange={() => handleToggleDayStatus(day.value, isCurrentlyActive)}
                                                            title={isCurrentlyActive ? "Cerrar todo el día" : "Abrir todo el día"}
                                                            disabled={daySlots.length === 0}
                                                        />
                                                        <span className={`status_label ${isCurrentlyActive ? 'active' : 'inactive'}`}>
                                                            {isCurrentlyActive ? 'Abierto' : 'Cerrado'}
                                                        </span>
                                                    </div>
                                                    <div className="slots_count_col">
                                                        {daySlots.length} {daySlots.length === 1 ? 'turno' : 'turnos'}
                                                    </div>
                                                    <div className="actions_col">
                                                        <button 
                                                            className="edit_day_btn" 
                                                            onClick={() => setActiveDay(day.value)}
                                                            title="Ver detalles"
                                                        >
                                                            Configurar <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="editor_header">
                                    <h4>Horarios para {DAYS_OF_WEEK.find(d => d.value === activeDay)?.label}</h4>
                                    <div className="editor_actions">
                                        <div className="toggle_day_container">
                                            <span className={`toggle_label ${isDayActive ? 'active' : ''}`}>
                                                {isDayActive ? 'Día Activo' : 'Día Inactivo'}
                                            </span>
                                            <Switch
                                                checked={isDayActive}
                                                onChange={() => handleToggleDayStatus(activeDay, isDayActive)}
                                                title={isDayActive ? "Desactivar todo el día" : "Activar todo el día"}
                                                disabled={!schedules[activeDay] || schedules[activeDay].length === 0}
                                            />
                                        </div>
                                        <button
                                            className="action_btn copy_btn"
                                            onClick={() => setCopying(!copying)}
                                            title="Copiar a otros días"
                                            disabled={schedules[activeDay].length === 0}
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <Button text='Añadir'Icon={Plus}onClick={handleAddTimeSlot}/>
                                    </div>
                                </div>

                                {copying && (
                                    <div className="copy_overlay">
                                        <p>Copiar horario de {DAYS_OF_WEEK.find(d => d.value === activeDay)?.label} a:</p>
                                        <div className="copy_days_grid">
                                            {DAYS_OF_WEEK.filter(d => d.value !== activeDay).map(day => (
                                                <button
                                                    key={day.value}
                                                    className="copy_day_target"
                                                    onClick={() => handleCopySchedule([day.value])}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                            <button className="copy_all_btn" onClick={() => handleCopySchedule(DAYS_OF_WEEK.filter(d => d.value !== activeDay).map(d => d.value))}>
                                                Todos los días
                                            </button>
                                        </div>
                                        <button className="cancel_copy" onClick={() => setCopying(false)}>Cancelar</button>
                                    </div>
                                )}
                                {/* LISTA DE HIRARIOS */}
                                <div className="slots_list">
                                    {(!schedules[activeDay] || schedules[activeDay].length === 0) ? (
                                        <div className="empty_slots center">
                                            <Clock size={40} />
                                            <p>No hay horarios configurados para este día.</p>
                                            <Button text="Empezar a añadir" onClick={handleAddTimeSlot} variant="cancel" />
                                        </div>
                                    ) : (
                                        schedules[activeDay].map((slot, index) => (
                                            <div key={index} className={`slot_item ${slot.is_closed ? 'inactive_slot' : ''}`}>
                                                <div className="slot_field">
                                                    <label><Clock size={12} /> Inicio</label>
                                                    <input
                                                        type="time"
                                                        value={slot.start_time}
                                                        onChange={(e) => handleUpdateField(index, 'start_time', e.target.value)}
                                                        disabled={slot.is_closed}
                                                    />
                                                </div>
                                                <div className="slot_field">
                                                    <label><Clock size={12} /> Fin</label>
                                                    <input
                                                        type="time"
                                                        value={slot.end_time}
                                                        onChange={(e) => handleUpdateField(index, 'end_time', e.target.value)}
                                                        disabled={slot.is_closed}
                                                    />
                                                </div>
                                                <div className="slot_field price_field">
                                                    <label><DollarSign size={12} /> Precio (S/)</label>
                                                    <input
                                                        type="number"
                                                        step="0.50"
                                                        min="0"
                                                        value={slot.price}
                                                        onChange={(e) => handleUpdateField(index, 'price', e.target.value)}
                                                        disabled={slot.is_closed}
                                                    />
                                                </div>
                                                <div className="slot_actions">
                                                    <button className="remove_slot_btn" onClick={() => handleRemoveTimeSlot(index)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        <div className="save_footer">
                            <div className="info_msg">
                                <AlertCircle size={14} />
                                <span>Recuerda guardar los cambios antes de salir.</span>
                            </div>
                            <Button
                                text={loadingSchedules ? "Guardando..." : "Guardar Horarios"}
                                Icon={Check}
                                onClick={handlePrepareAndSaveSchedules}
                                disabled={loadingSchedules}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpaceSchedulesForm;
