import React, { useEffect, useState } from 'react';
import { useCompanyDetails } from '../hooks/useCompanyDetails';
import '../styles/detailFaciliti.css';
import { ArrowLeft, MapPin, Phone, Globe, Mail, Building2, Calendar, Users, Plus } from 'lucide-react';
import Button from '../../../shared/components/Buttons'

const DetailsCompany = ({ handleViewChange }) => {
    const [companyId, setCompanyId] = useState(null);

    useEffect(() => {
        // Obtener el ID de la compañía desde localStorage
        const storedCompanyId = localStorage.getItem('selectedCompanyId');
        if (storedCompanyId) {
            setCompanyId(storedCompanyId);
        }
    }, []);

    const {
        companyDetails,
        loading,
        error,
        formatDate,
        getStatusClass,
        getStatusText,
    } = useCompanyDetails(companyId);

    if (loading) {
        return (
            <div className="detail_company">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando detalles de la compañía...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detail_company">
                <div className="error-container">
                    <p className="error-message">Error: {error}</p>
                    <button className="btn-back" onClick={() => handleViewChange('listCompany')}>
                        <ArrowLeft size={18} />
                        Regresar
                    </button>
                </div>
            </div>
        );
    }

    if (!companyDetails) {
        return (
            <div className="detail_company">
                <p>No se encontraron detalles de la compañía</p>
                <button className="btn-back" onClick={() => handleViewChange('listCompany')}>
                    <ArrowLeft size={18} />
                    Regresar
                </button>
            </div>
        );
    }

    return (
        <div className="detail_company">
            {/* Encabezado */}
            <section className="detail-header">
                <button className="btn-back" onClick={() => handleViewChange('listCompany')}>
                    <ArrowLeft size={18} />
                    Regresar
                </button>
                <h2>Detalles de la Empresa</h2>
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
                                <p>{companyDetails.country?.name || 'N/A'}</p>
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
                    <div style={{display: 'flex', gap: 12}}>

                        <Button
                            text='Nueva Sucursal'
                            // Icon={Plus}
                            variant='primary'
                            size='md'
                        />
                        {/* <Button
                            text='Nueva Sucursal'
                            variant='submit'
                            Icon={Plus}
                        />
                        <Button
                            text='Nueva Sucursal'
                            variant='cancel'
                            Icon={Plus}
                        />
                        <Button
                            text='Nueva Sucursal'
                            variant='back'
                            Icon={Plus}
                        />
                        <Button
                            text='Nueva Sucursal'
                            variant='danger'
                            Icon={Plus}
                        /> */}
                    </div>
                </div>
                {companyDetails.subsidiaries && companyDetails.subsidiaries.length > 0 ? (
                    <table className="facilities-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Documento</th>
                                <th>Dirección</th>
                                <th>Teléfono</th>
                                <th>País</th>
                                <th>Fecha de Registro</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companyDetails.subsidiaries.map((subsidiary) => (
                                <tr key={subsidiary.company_id}>
                                    <td>{subsidiary.name}</td>
                                    <td>{subsidiary.document}</td>
                                    <td className="address-cell">
                                        <span className="cell-with-icon">
                                            <MapPin size={14} />
                                            {subsidiary.address}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="cell-with-icon">
                                            <Phone size={14} />
                                            {subsidiary.phone} / {subsidiary.phone_cell}
                                        </span>
                                    </td>
                                    <td>{subsidiary.country?.name || 'N/A'}</td>
                                    <td>
                                        <span className="cell-with-icon">
                                            <Calendar size={14} />
                                            {formatDate(subsidiary.created_at)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status ${getStatusClass(subsidiary.is_enabled)}`}>
                                            {getStatusText(subsidiary.is_enabled)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No hay sucursales registradas para esta empresa.</p>
                )}
            </section>
        </div>
    );
};

export default DetailsCompany;
