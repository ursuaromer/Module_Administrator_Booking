/**
 * @description
 * Vista para ver detalles de una empresa o compañia
 * Trae datos de la empresa y sus sucursales
 */

import { useNavigate, useParams } from 'react-router-dom';
import '../styles/company.css';
import { useCompanyDetails } from '../hooks/useCompanyDetails';
import { RxValueNone } from "react-icons/rx";
import { FaRegCircleCheck, FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa6";
import { MdOutlineAccountTree } from "react-icons/md";
import { ArrowLeft, MapPin, Phone, Globe, Building2, Calendar, CreditCard, Cog, Users, Edit3, Plus, Eye, Edit, Clock, User, Settings } from 'lucide-react';
import Button from '../../../shared/components/Buttons'
import Table from '../../../shared/components/Table';
import { truncateText, capitalizeText, uppercaseText, getImageUrl } from '../../../shared/utils/formarText';
import { LoadingScreen, ErrorScreen, NotFoundScreen } from '../../../shared/components/ScreensMsg';

const Company = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const {
        companyDetails,
        loading,
        loadingEnabled,
        error,
        formatDate,
        getStatusClass,
        getStatusText,
        handlerViewSubsidiary,
        handlerEditSubsidiary,
        activeInactiveCompany,
    } = useCompanyDetails(companyId);

    if (loading) return <LoadingScreen message="Cargando detalles de la compañía..." />

    if (error) return <ErrorScreen message={error} />

    if (!companyDetails) return <NotFoundScreen message='No se encontraron información.' />

    const isCompanyActive = companyDetails.is_enabled === 'A' ? true : false
    const config = companyDetails.configuration;

    return (
        <div className="detail_company">
            {/* Perfil Estilo Facebook */}
            <section className="profile_header">
                <div className="banner_container">
                    {companyDetails.banner_url ? (
                        <img src={getImageUrl(companyDetails.banner_url)} alt="Banner" className="banner_img" />
                    ) : (
                        <div className="banner_placeholder">
                            <Building2 size={64} opacity={0.2} />
                        </div>
                    )}
                </div>

                <div className="profile_info_bar">
                    <div className="logo_container">
                        {companyDetails.logo_url ? (
                            <img src={getImageUrl(companyDetails.logo_url)} alt="Logo" className="logo_img" />
                        ) : (
                            <div className="logo_placeholder">
                                <Building2 size={48} />
                            </div>
                        )}
                    </div>

                    <div className="profile_main_details">
                        <h1>{companyDetails.name}</h1>
                        {config?.owner_name && (
                            <p className="owner_info">
                                <User size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                Propietario: {config.owner_name}
                            </p>
                        )}

                        <div className="social_links">
                            {config?.social_facebook && (
                                <a href={config.social_facebook} target="_blank" rel="noopener noreferrer" className="social_item facebook" title="Facebook">
                                    <FaFacebook size={20} />
                                </a>
                            )}
                            {config?.social_instagram && (
                                <a href={config.social_instagram} target="_blank" rel="noopener noreferrer" className="social_item instagram" title="Instagram">
                                    <FaInstagram size={20} />
                                </a>
                            )}
                            {config?.social_whatsapp && (
                                <a href={`https://wa.me/${config.social_whatsapp}`} target="_blank" rel="noopener noreferrer" className="social_item whatsapp" title="WhatsApp">
                                    <FaWhatsapp size={20} />
                                </a>
                            )}
                            {config?.social_tiktok && (
                                <a href={config.social_tiktok} target="_blank" rel="noopener noreferrer" className="social_item tiktok" title="TikTok">
                                    <FaTiktok size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="profile_actions">
                        <Button
                            text={loadingEnabled ? 'Actualizando...' : isCompanyActive ? 'Inactivar' : 'Activar'}
                            variant={isCompanyActive ? 'delete' : 'succes'}
                            Icon={isCompanyActive ? RxValueNone : FaRegCircleCheck}
                            onClick={() => activeInactiveCompany(companyDetails.company_id)}
                            disabled={loadingEnabled}
                            loading={loadingEnabled}
                        />
                        <Button text='Ver Arbol' Icon={MdOutlineAccountTree} />
                        <Button text='Configurar' Icon={Cog} onClick={() => navigate(`/companys/${companyId}/config`)} />
                        <Button text='Editar Datos' Icon={Edit} onClick={() => navigate(`/companys/${companyId}/edit`)} />
                    </div>
                </div>
            </section>

            {/* Información Principal */}
            <div className='row_group_section'>
                <div className="colum_group_section">
                    <section className="detail_section info_general">
                        <div className="section-title">
                            <h3><Building2 size={18} />Información General</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Nombre de la Empresa:</label>
                                <p>{companyDetails.name}</p>
                            </div>
                            <div className="info-item">
                                <label>Documento:</label>
                                <p>{companyDetails.document}</p>
                            </div>
                            <div className="info-item">
                                <label>Tenant ID:</label>
                                <p>{companyDetails.tenant_id}</p>
                            </div>
                            <div className="info-item">
                                <label>Estado:</label>
                                <span className={`status ${getStatusClass(companyDetails.is_enabled)}`}>
                                    {getStatusText(companyDetails.is_enabled)}
                                </span>
                            </div>
                            <div className="info-item">
                                <label>País:</label>
                                <p> <img src={companyDetails.country.flag} alt="" /> {companyDetails.country?.name || 'N/A'}</p>
                            </div>
                            <div className="info-item">
                                <label>Fecha de Registro:</label>
                                <p>{formatDate(companyDetails.created_at)}</p>
                            </div>
                        </div>
                    </section>
                    {/* Información Adicional */}
                    <section className="detail_section">
                        <div className="section-title">
                            <h3 >Información Adicional</h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Estacionamiento Disponible:</label>
                                <p>{companyDetails.parking_available ? 'Sí' : 'No'}</p>
                            </div>
                            {companyDetails.latitude && companyDetails.longitude && (
                                <>
                                    <div className="info-item">
                                        <label>Latitud:</label>
                                        <p>{companyDetails.latitude}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Longitud:</label>
                                        <p>{companyDetails.longitude}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </div>

                {/* Información de Contacto */}
                <section className="detail_section info_contacto">
                    <div className="section-title">
                        <h3><Phone size={18} />Información de Contacto</h3>
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <label><MapPin size={16} />Dirección:</label>
                            <p>{companyDetails.address}</p>
                        </div>
                        <div className="row_group_item">
                            <div className="info-item">
                                <label><Phone size={16} />Teléfono:</label>
                                <p>{companyDetails.phone}</p>
                            </div>
                            <div className="info-item">
                                <label><Phone size={16} />Celular:</label>
                                <p>{companyDetails.phone_cell}</p>
                            </div>
                        </div>
                        {companyDetails.website && (
                            <div className="info-item">
                                <label><Globe size={16} />Sitio Web:</label>
                                <a href={companyDetails.website} target="_blank" rel="noopener noreferrer">
                                    {companyDetails.website}
                                </a>
                            </div>
                        )}
                        <div className="row_group_item">
                            {companyDetails.postal_code && (
                                <div className="info-item">
                                    <label>Código Postal:</label>
                                    <p>{companyDetails.postal_code}</p>
                                </div>
                            )}
                            <div className="info-item">
                                <label>Código Ubigeo:</label>
                                <p>{companyDetails.ubigeo_code}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Descripción */}
            {companyDetails.description && (
                <section className="detail_section">
                    <div className="section-title">
                        <h3>Descripción</h3>
                    </div>
                    <p className="description-text">{companyDetails.description}</p>
                </section>
            )}

            {/* Sucursales */}
            <section className="detail_section">
                <div className="section-title">
                    <h3><Users size={18} />Sucursales ({companyDetails.subsidiaries?.length || 0})</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <Button
                            text='Nueva Sucursal'
                            variant='primary'
                            Icon={Plus}
                            onClick={() => navigate(`/companys/${companyId}/register-subsidiary`)}
                        />
                    </div>
                </div>

                <Table
                    data={companyDetails.subsidiaries}
                    emptyText="No hay sucursales registradas para esta empresa."
                    keyField="sucursal_id"
                    columns={[
                        { header: "Nombre", accessor: "name", cell: (value) => uppercaseText(value) },
                        { header: "Documento", accessor: "document" },
                        {
                            header: "Dirección",
                            cell: (_, row) => (
                                <span className="cell-with-icon">
                                    <MapPin size={14} />
                                    {capitalizeText(truncateText(row.address, 30))}
                                </span>
                            )
                        },
                        {
                            header: "Teléfono",
                            cell: (_, row) => (
                                <span className="cell-with-icon">
                                    <Phone size={14} />
                                    {row.phone} / {row.phone_cell}
                                </span>
                            )
                        },
                        {
                            header: 'Horarios',
                            cell: (_, row) => (
                                <span className="cell-with-icon">
                                    <Clock size={14} />
                                    {row.open_time} / {row.close_time}
                                </span>
                            )
                        },
                        { header: "País", accessor: "country", cell: (value) => value?.name || "N/A" },
                        {
                            header: "Fecha Registro", accessor: "created_at",
                            cell: (value) => (
                                <span className="cell-with-icon">
                                    <Calendar size={14} />
                                    {formatDate(value)}
                                </span>
                            )
                        },
                        {
                            header: 'Espacios', 
                            accessor: 'spaces',
                            cell: (value) => {
                                // Si value es un array de objetos, mostramos el conteo
                                if (Array.isArray(value)) {
                                    return value.length;
                                }
                                // Si ya es un número (por el DTO previo), lo mostramos
                                return value || 0;
                            }
                        },
                        {
                            header: "Estado", accessor: "is_enabled",
                            cell: (value) => (
                                <span className={`status ${getStatusClass(value)}`}>
                                    {getStatusText(value)}
                                </span>
                            )
                        },
                        {
                            header: 'Acciones',
                            cell: (_, row) => (
                                <div className="action-buttons">
                                    <button className='btn-view' onClick={() => handlerViewSubsidiary(row.sucursal_id)} title="Ver detalles"><Eye size={16} /></button>
                                    <button className='btn-edit' onClick={() => handlerEditSubsidiary(row.sucursal_id)} title="Editar"><Edit size={16} /></button>
                                </div>
                            )
                        }
                    ]}
                />
            </section>
        </div>
    );
};

export default Company;