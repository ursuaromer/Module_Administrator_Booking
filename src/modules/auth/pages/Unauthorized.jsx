import { ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/unauthorized.css';

const ROLE_LABELS = {
    system:        'System',
    super_admin:   'Super Admin',
    administrador: 'Administrador',
    empleado:      'Empleado',
    cliente:       'Cliente',
};

const getHomeRoute = (roles = [], companyIds = []) => {
    if (roles.includes('system'))        return { path: '/dashboard',                   label: 'Ir al Dashboard' };
    if (roles.includes('super_admin'))   return { path: '/companys',                    label: 'Ir a mis Empresas' };
    if (roles.includes('administrador')) return { path: `/subsidiary/${companyIds[0]}`, label: 'Ir a mi Sucursal' };
    if (roles.includes('empleado'))      return { path: `/bookings/${companyIds[0]}`,   label: 'Ir a Reservas' };
    return { path: '/login', label: 'Ir al Login' };
};

const Unauthorized = () => {
    const navigate = useNavigate();
    const { roles, companyIds, isAuthenticated } = useAuth();

    const primaryRole = roles?.[0] || null;
    const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : null;
    const home = getHomeRoute(roles, companyIds);

    return (
        <div className="unauthorized_page">
            <div className="unauthorized_card">
                <div className="unauthorized_icon_wrap">
                    <ShieldOff />
                </div>

                <p className="unauthorized_code">403</p>

                <h1 className="unauthorized_title">Acceso no autorizado</h1>

                <p className="unauthorized_msg">
                    No tienes permisos para ver esta página.
                </p>

                {roleLabel && (
                    <span className="unauthorized_role_badge">{roleLabel}</span>
                )}

                <div className="unauthorized_actions">
                    <button
                        className="btn_app btn_app_back btn_app_md"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </button>

                    {isAuthenticated && (
                        <button
                            className="btn_app btn_app_primary btn_app_md"
                            onClick={() => navigate(home.path)}
                        >
                            {home.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
