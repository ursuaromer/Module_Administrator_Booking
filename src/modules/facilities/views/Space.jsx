/**
 * Vista de detalles de un espacio deportivos
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/space.css';
import { useSpace } from '../hooks/useSpace';
import { ArrowLeft, Layout, Maximize, Users, Clock, ShieldCheck, Image as ImageIcon, Activity, Edit3, Trophy, Plus, X, Upload, Video, Info, Calendar, Trash2, Star, Eye } from 'lucide-react';
import Button from '../../../shared/components/Buttons';
import { LoadingScreen, ErrorScreen, NotFoundScreen } from '../../../shared/components/ScreensMsg';
import { uppercaseText } from '../../../shared/utils/formarText';
import SpaceSchedulesForm from '../components/SpaceSchedulesForm';
import MediaForm from '../components/MediaForm';
import MediaViewerModal from '../components/MediaViewerModal';
import Table from '../../../shared/components/Table';

import { formatDuration } from '../../../shared/utils/formarText';

const Space = () => {
    const navigate = useNavigate();
    const { subsidiaryId, spaceId } = useParams();

    const [selectedMediaIndex, setSelectedMediaIndex] = useState(null);

    const spaceHook = useSpace(spaceId);
    const {
        spaceDetails,
        loading,
        loadingSchedules,
        error,
        showSchedulesModal,
        setShowSchedulesModal,
        showMediaForm,
        setShowMediaForm,
        getStatusClass,
        handleDeleteMedia,
        handleSetPrimaryMedia,
        schedules
    } = spaceHook;

    if (loading) return <LoadingScreen message="Cargando detalles del espacio..." />;
    if (error) return <ErrorScreen message={error} />;
    if (!spaceDetails) return <NotFoundScreen message="No se encontró información del espacio." />;

    const allMedia = spaceDetails.media || [];
    console.log(spaceDetails);
    
    // URL base para archivos del backend (obteniendo solo el origen de la API)
    const backendUrl = new URL(import.meta.env.VITE_API_URL).origin;

    const getMediaUrl = (item) => {
        if (item.url && item.url.startsWith('/')) {
            return `${backendUrl}${item.url}`;
        }
        return item.url;
    };

    const isVideo = (item) => {
        const url = getMediaUrl(item);
        if (!url) return false;
        return item.type === 'VIDEO' || url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov');
    };

    const handleNextMedia = () => {
        setSelectedMediaIndex((prev) => (prev + 1) % allMedia.length);
    };

    const handlePrevMedia = () => {
        setSelectedMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    };

    const scheduleColumns = [
        {
            header: 'Día',
            accessor: 'day_of_week',
            cell: (value, row) => {
                const dayValue = value || row.day;
                const dayMap = {
                    'MONDAY': 'Lunes',
                    'TUESDAY': 'Martes',
                    'WEDNESDAY': 'Miércoles',
                    'THURSDAY': 'Jueves',
                    'FRIDAY': 'Viernes',
                    'SATURDAY': 'Sábado',
                    'SUNDAY': 'Domingo'
                };
                return dayMap[dayValue] || dayValue;
            }
        },
        { header: 'Hora Inicio', accessor: 'start_time' },
        { header: 'Hora Fin', accessor: 'end_time' },
        {
            header: 'Precio',
            accessor: 'price',
            cell: (value) => `S/ ${parseFloat(value).toFixed(2)}`
        },
        {
            header: 'Estado',
            accessor: 'is_closed',
            cell: (value) => (
                <span className={`status ${getStatusClass(value)}`}>
                    {value ? 'Inactivo' : 'Activo'}
                </span>
            )
        }
    ];

    // Convertir el objeto de horarios agrupados a una lista plana para la tabla
    const flatSchedules = Object.values(schedules).flat();

    return (
        <>
            <div className="detail_space">
                <header className="space_header_banner">
                    <div className="header_content">
                        <h2>{uppercaseText(spaceDetails.name)}</h2>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span className="sport_badge"><Trophy size={16} /> {spaceDetails.sport?.name || 'Deporte'}</span>
                            <span className={`status ${getStatusClass(spaceDetails.status === 'ACTIVE' ? 'A' : 'I')}`}>
                                {spaceDetails.status === 'ACTIVE' ? 'Activo' :
                                    spaceDetails.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Inactivo'}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                {spaceDetails.category?.name || 'Categoría'}
                            </span>
                        </div>
                    </div>

                    <div className="header_actions">
                        <Button
                            text='Editar Espacio'
                            Icon={Edit3}
                            onClick={() => navigate(`/subsidiary/${subsidiaryId}/space/${spaceId}/edit`)}
                        />
                        <Button
                            text='Volver'
                            variant='cancel'
                            Icon={ArrowLeft}
                            onClick={() => navigate(`/subsidiary/${subsidiaryId}`)}
                        />
                    </div>
                </header>

                <div className="space_content_grid">
                    <div className="info_card_modern">
                        <div className="card_header">
                            <div className="card_icon"><Layout size={20} /></div>
                            <h3>Especificaciones Técnicas</h3>
                        </div>

                        <div className="detail_list">
                            <div className="detail_item">
                                <label><Activity size={14} /> Superficie</label>
                                <p>{spaceDetails.surface?.name || 'N/A'}</p>
                            </div>
                            <div className="detail_item">
                                <label><Maximize size={14} /> Dimensiones</label>
                                <p>{spaceDetails.dimensions || 'N/A'}</p>
                            </div>
                            <div className="detail_item">
                                <label><Users size={14} /> Capacidad</label>
                                <p>{spaceDetails.capacity} personas</p>
                            </div>
                        </div>
                    </div>

                    <div className="info_card_modern">
                        <div className="card_header">
                            <div className="card_icon"><Trophy size={20} /></div>
                            <h3>Equipamiento Disponible</h3>
                        </div>
                        <div className="equipment_list">
                            {spaceDetails.equipment && spaceDetails.equipment.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                    {spaceDetails.equipment.map((item, index) => (
                                        <span key={index} className="feature_badge" style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            padding: '4px 12px', 
                                            borderRadius: '20px',
                                            fontSize: '1.1rem',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '10px' }}>
                                    No se ha especificado equipamiento.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="info_card_modern">
                        <div className="card_header">
                            <div className="card_icon"><ShieldCheck size={20} /></div>
                            <h3>Reglas de Reserva</h3>
                        </div>

                        <div className="detail_list">
                            <div className="detail_item">
                                <label><Clock size={14} /> Duración permitida</label>
                                <p>{formatDuration(spaceDetails.booking_rules?.min_minutes)} - {formatDuration(spaceDetails.booking_rules?.max_minutes)}</p>
                            </div>
                            <div className="detail_item">
                                <label><Clock size={14} /> Tiempo de Cortesía</label>
                                <p>{formatDuration(spaceDetails.booking_rules?.buffer_minutes)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {spaceDetails.description && (
                    <section className="info_card_modern">
                        <div className="card_header">
                            <div className="card_icon"><Info size={20} /></div>
                            <h3>Descripción del Espacio</h3>
                        </div>
                        <p className='text_description' style={{ lineHeight: '1.6', color: 'var(--text)', margin: 0 }}>
                            {spaceDetails.description}
                        </p>
                    </section>
                )}

                <section className="info_card_modern schedule_table_section">
                    <div className="card_header">
                        <div className="card_icon"><Calendar size={20} /></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Horarios y Tarifas Configuradas</h3>
                            <Button
                                text='Gestionar Horarios'
                                Icon={Calendar}
                                onClick={() => setShowSchedulesModal(true)}
                            />
                        </div>
                    </div>

                    <div className="table_container_modern">
                        {loadingSchedules ? (
                            <LoadingScreen size='sm' message="Cargando horarios..." />
                        ) : (
                            <Table
                                columns={scheduleColumns}
                                data={flatSchedules}
                                emptyText="No hay horarios configurados para este espacio."
                                keyField="hour_id"
                            />
                        )}
                    </div>
                </section>

                <section className="gallery_section info_card_modern">
                    <div className="card_header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%' }}>
                            <div className="card_icon"><ImageIcon size={20} /></div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Galería Multimedia</h3>
                        </div>

                        <div>
                            <Button
                                text="Añadir Imagen/Video"
                                Icon={Plus}
                                onClick={() => setShowMediaForm(true)}
                                variant="primary"
                            />
                        </div>
                    </div>

                    <div className={allMedia.length > 0 ? 'gallery_masonry' : 'empty_gallery_masonry'}>
                        {allMedia.length > 0 ? (
                            allMedia.map((item, index) => {
                                const mediaUrl = getMediaUrl(item);
                                const mediaIsVideo = isVideo(item);

                                return (
                                    <div key={item.id || item.media_id} className="gallery_masonry_item" onClick={() => setSelectedMediaIndex(index)}>
                                        {mediaIsVideo ? (
                                            <>
                                                <video src={mediaUrl} />
                                                <div className="video_icon_overlay center">
                                                    <Video size={24} />
                                                </div>
                                            </>
                                        ) : (
                                            <img src={mediaUrl} alt={spaceDetails.name} loading="lazy" />
                                        )}
                                        <div className="media_actions_top">
                                            {!item.isLocal && (
                                                <>
                                                    {/* <button
                                                        className={`action_btn ${item.is_primary ? 'primary_active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSetPrimaryMedia(item.id || item.media_id);
                                                        }}
                                                        title={item.is_primary ? "Ya es principal" : "Marcar como principal"}
                                                    >
                                                        <Star size={22} fill={item.is_primary ? "orangered" : "none"} stroke={item.is_primary ? 'red' : 'black'} />
                                                    </button> */}
                                                    <button
                                                        className="action_btn delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
                                                                handleDeleteMedia(item.id || item.media_id);
                                                            }
                                                        }}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={22} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {item.is_primary && <span className="gallery_badge badge_primary">Principal</span>}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty_state_gallery center">
                                <ImageIcon size={48} strokeWidth={1.5} />
                                <p>No hay multimedia disponible. ¡Agrega las mejores fotos de tu espacio!</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            {/* Modal de Gestión de Horarios */}
            {showSchedulesModal && (
                <SpaceSchedulesForm
                    spaceId={spaceId}
                    spaceHook={spaceHook}
                    setShowSchedulesModal={setShowSchedulesModal}
                />
            )}
            {/* Modal de Formulario de subida de archivos */}
            {showMediaForm && (
                <MediaForm
                    setView={setShowMediaForm}
                    spaceId={spaceId}
                    hook={spaceHook}
                />
            )}

            {/* Visualizador Multimedia */}
            {selectedMediaIndex !== null && (
                <MediaViewerModal
                    media={{
                        ...allMedia[selectedMediaIndex],
                        url: getMediaUrl(allMedia[selectedMediaIndex])
                    }}
                    onClose={() => setSelectedMediaIndex(null)}
                    onNext={handleNextMedia}
                    onPrev={handlePrevMedia}
                    totalMedia={allMedia.length}
                    currentIndex={selectedMediaIndex}
                />
            )}
        </>
    );
};

export default Space;
