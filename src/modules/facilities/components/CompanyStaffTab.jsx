/**
 * CompanyStaffTab
 * Tab reutilizable para "Mis Admins" y "Empleados" en ConfigCompany.
 *
 * roleType = 'administrador' → muestra/crea administradores
 * roleType = 'empleado'      → muestra/crea empleados + columna de permisos
 *
 * Recibe el staff completo del tenant (ya cargado por el padre) y filtra por roleType.
 * El botón "Nuevo" abre RegisterUserModal con context='subsidiary' y un selector de sucursal.
 */
import { useState, useMemo } from 'react';
import { Users, Plus, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import Button from '../../../shared/components/Buttons';
import Table from '../../../shared/components/Table';
import RegisterUserModal from './RegisterUserModal';
import { uppercaseText } from '../../../shared/utils/formarText';

// Mapeo de clave de permiso a etiqueta legible
const PERMISSION_LABELS = {
    'booking.create':         'Crear reservas',
    'booking.view_facility':  'Ver instalaciones',
    'booking.confirm':        'Confirmar reservas',
    'booking.cancel':         'Cancelar reservas',
    'space.view':             'Ver espacios',
    'space.manage':           'Gestionar espacios',
    'company.view':           'Ver empresa',
    'company.manage':         'Gestionar empresa',
    'report.view':            'Ver reportes',
};

const PermissionBadges = ({ permissions = [] }) => {
    const [expanded, setExpanded] = useState(false);
    if (!permissions.length) return <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Sin permisos</span>;

    const visible = expanded ? permissions : permissions.slice(0, 2);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
            {visible.map(p => (
                <span key={p} className="permission-badge">
                    {PERMISSION_LABELS[p] || p}
                </span>
            ))}
            {permissions.length > 2 && (
                <button
                    onClick={() => setExpanded(v => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.78rem', padding: '0 2px' }}
                >
                    {expanded ? <ChevronUp size={14} /> : `+${permissions.length - 2} más`}
                </button>
            )}
        </div>
    );
};

const CompanyStaffTab = ({ roleType, staff = [], subsidiaries = [], onStaffUpdated }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedSubsidiaryId, setSelectedSubsidiaryId] = useState(null);

    const label = roleType === 'administrador' ? 'Administrador' : 'Empleado';
    const labelPlural = roleType === 'administrador' ? 'Administradores' : 'Empleados';

    // Filtrar staff por roleType
    const filtered = useMemo(
        () => staff.filter(u => u.role_name === roleType),
        [staff, roleType]
    );

    // Las sucursales del hook usan sucursal_id; el staff usa company_id — normalizamos para comparar
    const subId = (sub) => Number(sub.sucursal_id ?? sub.company_id);

    const columns = [
        {
            header: 'Nombre',
            cell: (_, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="staff-avatar">
                        {r.first_name?.[0]}{r.last_name?.[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{r.first_name} {r.last_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{r.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Sucursal',
            accessor: 'company_name',
            cell: v => v ? <span className="subsidiary-tag">{uppercaseText(v)}</span> : '—'
        },
        ...(roleType === 'empleado' ? [{
            header: 'Permisos',
            cell: (_, r) => <PermissionBadges permissions={r.permissions || []} />
        }] : []),
        {
            header: 'Estado',
            accessor: 'is_enabled',
            cell: v => (
                <span className={`status_badge ${v ? 'active' : 'inactive'}`}>
                    {v ? 'Activo' : 'Inactivo'}
                </span>
            )
        }
    ];

    const handleOpenModal = (subsidiaryId) => {
        setSelectedSubsidiaryId(subsidiaryId);
        setShowModal(true);
    };

    return (
        <section className="staff_tab animate-fade-in">
            <div className="staff-header">
                <div>
                    <h3><Users size={18} /> {labelPlural} ({filtered.length})</h3>
                    <p style={{ fontSize: '0.87rem', color: 'var(--text-light)', margin: '4px 0 0' }}>
                        {roleType === 'administrador'
                            ? 'Gestiona los administradores asignados a cada sucursal.'
                            : 'Gestiona el personal de cada sucursal y sus permisos de acceso.'}
                    </p>
                </div>

                {/* Selector de sucursal + botón crear */}
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        className="subsidiary-select"
                        value={selectedSubsidiaryId || ''}
                        onChange={e => setSelectedSubsidiaryId(Number(e.target.value) || null)}
                    >
                        <option value="">Seleccionar sucursal...</option>
                        {subsidiaries.map(s => (
                            <option key={subId(s)} value={subId(s)}>{s.name}</option>
                        ))}
                    </select>
                    <Button
                        text={`Nuevo ${label}`}
                        variant="primary"
                        Icon={Plus}
                        disabled={!selectedSubsidiaryId}
                        onClick={() => selectedSubsidiaryId && handleOpenModal(selectedSubsidiaryId)}
                    />
                </div>
            </div>

            {/* Agrupar por sucursal */}
            {subsidiaries.length > 0 ? (
                subsidiaries.map(sub => {
                    const id = subId(sub);
                    const subStaff = filtered.filter(u => Number(u.company_id) === id);
                    return (
                        <div key={id} className="subsidiary-group">
                            <div className="subsidiary-group-header">
                                <span>{uppercaseText(sub.name)}</span>
                                <span className="count-badge">{subStaff.length}</span>
                            </div>
                            <Table
                                data={subStaff}
                                emptyText={`Sin ${labelPlural.toLowerCase()} en esta sucursal.`}
                                keyField="user_company_id"
                                columns={columns}
                            />
                        </div>
                    );
                })
            ) : (
                <Table
                    data={filtered}
                    emptyText={`No hay ${labelPlural.toLowerCase()} registrados.`}
                    keyField="user_company_id"
                    columns={columns}
                />
            )}

            {showModal && selectedSubsidiaryId && (
                <RegisterUserModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    companyId={selectedSubsidiaryId}
                    context="subsidiary"
                    onSuccess={() => {
                        setShowModal(false);
                        onStaffUpdated?.();
                    }}
                />
            )}
        </section>
    );
};

export default CompanyStaffTab;
