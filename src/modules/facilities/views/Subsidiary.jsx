/**
 * @description
 * Vista para ver detalles de una sucursal
 * Trae datos de la sucursal y sus espacios deprotivos dentro de ella.
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/sucursal.css';
import { useSucursalDetails } from '../hooks/useSucursalDetails';
import { ArrowLeft, Building2, MapPin, Phone, Globe, Edit3, Plus, Eye, Edit, Info, Layers, Smartphone, Clock, Cog, MapPinIcon } from 'lucide-react';
import Button from '../../../shared/components/Buttons';
import Table from '../../../shared/components/Table';
import { uppercaseText, getImageUrl} from '../../../shared/utils/formarText';
import { LoadingScreen, ErrorScreen, NotFoundScreen } from '../../../shared/components/ScreensMsg';
import SucursalFullConfigModal from '../components/SucursalFullConfigModal';

const Subsidiary = () => {
    const navigate = useNavigate();
    const { subsidiaryId } = useParams();

    const [showConfigModal, setShowConfigModal] = useState(false);

    const {
        sucursalDetails,
        loading,
        loadingEnabled,
        error,
        loadSucursalDetails,
        formatDate,
        getStatusClass,
        getStatusText,
        activeInactiveSucursal,
    } = useSucursalDetails(subsidiaryId);

    if (loading) return <LoadingScreen message="Cargando detalles de la sucursal..." />
    if (error) return <ErrorScreen message={error} />
    if (!sucursalDetails) return <NotFoundScreen message='No se encontraron información.' />

    const isCompanyActive = sucursalDetails.is_enabled === 'A' ? true : false;
    console.log(sucursalDetails);
    
    return (
        <div className="detail_subsidiary">
            {/* Banner y Header Moderno */}
            <header className="subsidiary_banner_header">
                <div className="banner_container">
                    {sucursalDetails.logo_url ? (
                        <img 
                            src={getImageUrl(sucursalDetails.logo_url)} 
                            alt={sucursalDetails.name} 
                            className="banner_img"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-company.png';
                            }}
                        />
                    ) : (
                        <div className="banner_placeholder">
                            <Building2 size={80} />
                        </div>
                    )}
                    <div className="banner_overlay">
                        <div className="banner_content">
                            <div className="banner_info">
                                <h1>{uppercaseText(sucursalDetails.name)}</h1>
                                <div className="banner_badges">
                                    <span className='parent_badge'>
                                        <Building2 size={16} />
                                        {uppercaseText(sucursalDetails.parent_company_name)}
                                    </span>
                                    <span className={`status_badge ${isCompanyActive ? 'active' : 'inactive'}`}>
                                        {getStatusText(sucursalDetails.is_enabled)}
                                    </span>
                                </div>
                                <p className="banner_address">
                                    <MapPin size={16} /> {sucursalDetails.address}
                                </p>
                            </div>
                            <div className="banner_actions">
                                <Button
                                    text={loadingEnabled ? '...' : isCompanyActive ? 'Inactivar' : 'Activar'}
                                    variant={isCompanyActive ? 'delete' : 'succes'}
                                    onClick={() => activeInactiveSucursal(sucursalDetails.company_id)}
                                    disabled={loadingEnabled}
                                />
                                <Button
                                    text='Configuración'
                                    Icon={Cog}
                                    onClick={() => setShowConfigModal(true)}
                                />
                                <Button
                                    text='Editar'
                                    Icon={Edit3}
                                    onClick={() => navigate(`/subsidiary/${subsidiaryId}/edit`)}
                                />
                                <Button
                                    text='Volver'
                                    variant='cancel'
                                    Icon={ArrowLeft}
                                    onClick={() => navigate(`/companys/${sucursalDetails.parent_company_id || sucursalDetails.company_id}`)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Columna Principal */}
            <main className="subsidiary_main">
                {/* Información General en Cards */}
                <section className="sub_section">
                    <div className="section_title">
                        <h3><Info size={18} /> Detalles Operativos</h3>
                    </div>
                    <div className="info_cards">
                        <div className="info_card">
                            <label>Documento</label>
                            <p>{sucursalDetails.document}</p>
                        </div>
                        <div className="info_card">
                            <label>Dueño</label>
                            <p>Proximamente..</p>
                        </div>
                        <div className="info_card">
                            <label>Tenant ID</label>
                            <p>{sucursalDetails.tenant_id}</p>
                        </div>
                        <div className="info_card">
                            <label>País</label>
                            <p><img src={sucursalDetails.country?.flag} alt="" /> {sucursalDetails.country?.name || 'N/A'}</p>
                        </div>
                        <div className="info_card">
                            <label>Registro</label>
                            <p>{formatDate(sucursalDetails.created_at)}</p>
                        </div>
                        <div className="info_card">
                            <label>Actualizado</label>
                            <p>{formatDate(sucursalDetails.updated_at)}</p>
                        </div>
                    </div>
                </section>

                {/* Características */}
                <section className="sub_section">
                    <div className="section_title">
                        <h3><MapPinIcon size={18} />Ubicación y Otros</h3>
                    </div>
                    <div className="info_cards">
                        {sucursalDetails.latitude && (
                            <div className="info_card">
                                <label>Coordenadas</label>
                                <p>{sucursalDetails.latitude}, {sucursalDetails.longitude}</p>
                            </div>
                        )}
                        <div className="info_card">
                            <label>Ubigeo</label>
                            <p>{sucursalDetails.ubigeo_code}</p>
                        </div>
                        <div className="info_card">
                            <label>Estacionamiento</label>
                            <p>{sucursalDetails.parking_available ? 'Disponible' : 'No disponible'}</p>
                        </div>
                    </div>
                </section>

                <section className="sub_section">
                    <div className="section_title">
                        <h3><Layers size={18} />Características</h3>
                    </div>
                    <div className="info_cards">
                        {sucursalDetails.features?.map((item, i) => (
                            <div key={i} className="info_card">
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Descripción */}
                {sucursalDetails.description && (
                    <section className="sub_section">
                        <div className="section_title">
                            <h3>Descripción</h3>
                        </div>
                        <p className="description-text" style={{ fontSize: '1rem', color: '#4a5568', lineHeight: '1.6' }}>
                            {sucursalDetails.description}
                        </p>
                    </section>
                )}
            </main>

            {/* Sidebar de Lateral */}
            <aside className="subsidiary_sidebar">
                {/* Contacto */}
                <section className="sub_section">
                    <div className="section_title">
                        <h3><Phone size={18} /> Contacto</h3>
                    </div>
                    <div className="info_cards contacto">
                        <div className="contact_item">
                            <div className="icon_box"><MapPin size={20} /></div>
                            <div className="contact_info">
                                <label>Dirección</label>
                                <p>{sucursalDetails.address}</p>
                            </div>
                        </div>
                        <div className="contact_item">
                            <div className="icon_box"><Phone size={20} /></div>
                            <div className="contact_info">
                                <label>Teléfono Fijo</label>
                                <p>{sucursalDetails.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="contact_item">
                            <div className="icon_box"><Smartphone size={20} /></div>
                            <div className="contact_info">
                                <label>Celular</label>
                                <p>{sucursalDetails.phone_cell || 'N/A'}</p>
                            </div>
                        </div>
                        {sucursalDetails.website && (
                            <div className="contact_item">
                                <div className="icon_box"><Globe size={20} /></div>
                                <div className="contact_info">
                                    <label>Sitio Web</label>
                                    <p><a href={sucursalDetails.website} target="_blank" rel="noopener noreferrer">Link Externo</a></p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                {/* Horarios */}
                <section className="sub_section">
                    <div className="section_title">
                        <h3><Clock size={18} /> Horarios</h3>
                    </div>
                    <div className="info_cards horarios">
                        <div className="info_card">
                            <label>Abre</label>
                            <p>{sucursalDetails.opening_time}</p>
                        </div>
                        <div className="info_card">
                            <label>Cierra</label>
                            <p>{sucursalDetails.closing_time} </p>
                        </div>
                    </div>
                </section>
                <section className="sub_section">
                    <div className="section_title">
                        <h3><Clock size={18} /> Precio desde</h3>
                    </div>
                    <div className="info_cards horarios">
                        <div className="info_card">
                            <label>Mínimo</label>
                            <p>{sucursalDetails.min_price}</p>
                        </div>
                    </div>
                </section>
            </aside>

            {/* Tabla de Espacios (Full Width Footer) */}
            <footer className="subsidiary_footer">
                <section className="sub_section">
                    <div className="section_title">
                        <h3>Espacios Deportivos ({sucursalDetails.spaces?.length || 0})</h3>
                        <Button
                            text='Nuevo Espacio'
                            variant='primary'
                            Icon={Plus}
                            onClick={() => navigate(`/subsidiary/${subsidiaryId}/register-space`)}
                        />
                    </div>

                    <Table
                        data={sucursalDetails.spaces}
                        emptyText="No hay espacios deportivos registrados."
                        keyField="id"
                        columns={[
                            { header: "Nombre", accessor: "name", cell: (value) => uppercaseText(value) },
                            { header: "Deporte", accessor: "sportType", cell: (value) => value?.name || "N/A" },
                            { header: "Categoría", accessor: "category", cell: (value) => value?.name || "N/A" },
                            { header: "Capacidad", accessor: "capacity", cell: (value) => `${value} pers.` },
                            { header: "Precio/H", accessor: "hourly", cell: (value) => `S/ ${value || 0}` },
                            {
                                header: "Estado", accessor: "status",
                                cell: (value) => (
                                    <span className={`status_badge ${value === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                        {value === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                    </span>
                                )
                            },
                            {
                                header: 'Acciones',
                                cell: (_, row) => (
                                    <div className="action-buttons">
                                        <button className='btn-view' onClick={() => navigate(`/subsidiary/${subsidiaryId}/space/${row.space_id}`)} title="Ver"><Eye size={16} /></button>
                                        <button className='btn-edit' onClick={() => navigate(`/subsidiary/${subsidiaryId}/space/${row.space_id}/edit`)} title="Editar"><Edit size={16} /></button>
                                    </div>
                                )
                            }
                        ]}
                    />
                </section>
            </footer>

            {/* Modal de Configuración Completa de Sucursal */}
            {showConfigModal && (
                <SucursalFullConfigModal
                    sucursal={sucursalDetails}
                    onClose={() => setShowConfigModal(false)}
                    onSaveSuccess={() => {
                        loadSucursalDetails(subsidiaryId);
                        setShowConfigModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Subsidiary;