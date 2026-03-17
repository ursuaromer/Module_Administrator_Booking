import { useEffect } from 'react';
import { Building2, MapPin, Phone, User, Search } from 'lucide-react';
import { TbCalendarCheck } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useCompanyList } from '../../facilities/hooks/useCompanyList';
import useBookingReservation from '../hooks/useBookingReservation';
import { useAuth } from '../../auth/context/AuthContext';
import '../styles/MyCompany.css';
import { SearchSelect, Button } from '../../../shared/components';
import { getImageUrl } from '../../../shared/utils/formarText';
import toast from 'react-hot-toast';

/**
 * Vista de Empresas
 * Implementa selección jerárquica de Empresa y sus Sucursales.
 */
const MyCompany = () => {
    const navigate = useNavigate();
    const { roles, companyIds } = useAuth();
    const { loadCompanies } = useCompanyList({ autoLoad: false });

    const {
        selectedCompanyId,
        setSelectedCompanyId,
        selectedCompany,
        subsidiaries,
        loadingSubsidiaries
    } = useBookingReservation();

    // administrador y empleado tienen asignada su sucursal en companyIds[0] — redirigir directo
    useEffect(() => {
        const isRestricted = roles.some(r => r === 'administrador' || r === 'empleado');
        if (isRestricted && companyIds.length > 0) {
            navigate(`/bookings/${companyIds[0]}`, { replace: true });
        }
    }, [roles, companyIds, navigate]);

    const handleSearchRemote = async (term) => {
        const payload = await loadCompanies({ search: term, page: 1, limit: 10 });
        return (payload?.data || []).map(c => ({
            value: c.company_id,
            label: c.name,
            subLabel: `Doc: ${c.document}`
        }));
    };

    const companyOptions = selectedCompany ? [{
        value: selectedCompany.company_id,
        label: selectedCompany.name,
        subLabel: `Doc: ${selectedCompany.document}`
    }] : [];

    // Funcion para mavegar a Bookings
    const handleNavigateToBookings = ({subsidiarie}) => {
        if(subsidiarie.spaces?.length > 0) {
            navigate(`/bookings/${subsidiarie.sucursal_id}`);
        } else {
            toast.error('Esta sucursal no tiene espacios disponibles.', {icon: '⚠️'});
        }
    };

    return (
        <div className='view_company_companys'>

            {/* ── Topbar ─────────────────────────────────────────── */}
            <header className='bookings_topbar'>
                <div className='topbar__left'>
                    <h1 className='topbar_title center'>
                        <TbCalendarCheck size={20} />
                        Administra Reservas
                    </h1>
                </div>

                <div className='topbar__right'>
                   
                </div>
            </header>

            {/* ── Contenido ──────────────────────────────────────── */}
            <div className='bookings-content-wrapper'>
                {!selectedCompanyId ? (
                    <div className='bookings-empty-state'>
                        <div className='select_container'>
                            <SearchSelect
                                variant={true}
                                label="Busca tu empresa..."
                                name="booking-company-select"
                                value={selectedCompanyId}
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                options={companyOptions}
                                onSearch={handleSearchRemote}
                                loading={loadingSubsidiaries}
                                placeholder="Buscar empresa principal..."
                                icon={Search}
                                iconPosition="right"
                                required
                            />
                        </div>
                        <Building2 className='empty-icon' />
                        <h3>Sin empresa seleccionada</h3>
                        <p>Busca y selecciona una empresa principal para gestionar sus sucursales y reservas.</p>
                    </div>
                ) : loadingSubsidiaries && !selectedCompany ? (
                    <div className='bookings-empty-state'>
                        <div className='search_spinner'></div>
                        <p>Cargando información de la empresa...</p>
                    </div>
                ) : selectedCompany ? (
                    <div className='subsidiary-selection-view'>
                        <div className='company-info-card'>
                            <div className='info-header'>
                                {selectedCompany?.configuration?.logo_url ? (
                                    <div className='company-logo-container'>
                                        <img src={getImageUrl(selectedCompany.configuration.logo_url)} alt="Logo" className="company-logo" />
                                    </div>
                                ) : (
                                    <Building2 size={32} />
                                )}
                                <h2>{selectedCompany?.name || 'Cargando...'}</h2>
                            </div>
                            <div className='info-grid'>
                                <div className='info-item'>
                                    <MapPin size={16} />
                                    <span>{selectedCompany?.address || '---'}</span>
                                </div>
                                <div className='info-item'>
                                    <Phone size={16} />
                                    <span>{selectedCompany?.phone || '---'}</span>
                                </div>
                                {selectedCompany?.configuration?.owner_name && (
                                    <div className='info-item'>
                                        <User size={16} />
                                        <span>Propietario: {selectedCompany.configuration.owner_name}</span>
                                    </div>
                                )}
                                {selectedCompany?.configuration?.owner_phone && (
                                    <div className='info-item'>
                                        <Phone size={16} />
                                        <span>Tel. Propietario: {selectedCompany.configuration.owner_phone}</span>
                                    </div>
                                )}
                                {selectedCompany?.country && (
                                    <div className='info-item'>
                                        <img src={selectedCompany.country.flag} alt={selectedCompany.country.name} className='country-flag-mini' />
                                        <span>{selectedCompany.country.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='subsidiaries-list-container'>
                            <h3>Sucursales Disponibles ({subsidiaries?.length || 0})</h3>
                            {loadingSubsidiaries ? (
                                <p>Cargando sucursales...</p>
                            ) : subsidiaries?.length > 0 ? (
                                <div className='subsidiaries-grid'>
                                    {subsidiaries.map(sub => (
                                        <div
                                            key={sub.sucursal_id}
                                            className='subsidiary-card'
                                            onClick={() => handleNavigateToBookings({subsidiarie: sub})}
                                        >
                                            <h4>{sub.name}</h4>
                                            <p><MapPin size={12} /> {sub.address}</p>
                                            <span>{sub.open_time || '--:--'} - {sub.close_time || '--:--'}</span>
                                            <div className='card-footer'>
                                                <span className='badge-spaces'>{sub.spaces?.length || 0} Espacios</span>
                                                <Button text="Gestionar" variant="primary" size="sm" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='no-subsidiaries'>
                                    <p>Esta empresa no tiene sucursales registradas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className='bookings-empty-state'>
                        <div className='search_spinner'></div>
                        <p>Preparando vista...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCompany;
