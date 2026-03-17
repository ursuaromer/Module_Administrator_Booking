import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/appAdmin.css'
import { Home, CreditCard, ArrowLeftRight, FileText, Building2, Users2, Gift, Cog, HelpCircle, LogOut } from 'lucide-react';
import { TbLayoutSidebarLeftCollapse, TbCalendarCheck } from "react-icons/tb";
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import logo from '../../assets/icons/company.png'

const AppAdmin = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [proMode, setProMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const lastNonBookingsCollapsedRef = useRef(isCollapsed);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const isBookingsRoute = location.pathname.startsWith('/bookings');

    useEffect(() => {
        if (!isBookingsRoute) {
            lastNonBookingsCollapsedRef.current = isCollapsed;
        }
    }, [isBookingsRoute, isCollapsed]);

    useEffect(() => {
        if (isBookingsRoute) {
            setIsCollapsed(true);
        } else {
            setIsCollapsed(lastNonBookingsCollapsedRef.current);
        }
    }, [isBookingsRoute]);

    const breadcrumbItems = useMemo(() => {
        const pathname = location.pathname || '';
        const clean = pathname.replace(/\/+$/, '');
        const segments = clean.split('/').filter(Boolean);

        const labels = {
            dashboard: 'Dashboard',
            companys: 'Compañias',
            subsidiary: 'Sucursal',
            space: 'Espacio',
            register: 'Registrar',
            edit: 'Editar',
            'register-subsidiary': 'Nueva Sucursal',
            'register-space': 'Nuevo Espacio',
            users: 'Usuarios',
            bookings: 'Reservas',
            statistics: 'Estadistica',
            reports: 'Reportes',
            payment: 'Payment',
            transaction: 'Transaction',
            earn: 'Earn',
        };

        const items = [];
        let acc = '';

        for (let idx = 0; idx < segments.length; idx++) {
            const seg = segments[idx];
            acc += `/${seg}`;

            if (seg === 'dashboard') {
                items.push({ to: '/dashboard', label: labels.dashboard });
                continue;
            }

            // Manejo de la ruta de sucursales (flat route) para que parezca anidada
            if (seg === 'subsidiary') {
                // Insertamos "Compañías" antes de la sucursal para mantener la jerarquía lógica
                items.push({ to: '/companys', label: labels.companys });

                if (segments[idx + 1]) {
                    const subsidiaryId = segments[idx + 1];
                    acc += `/${subsidiaryId}`;
                    items.push({ to: acc, label: `Sucursal ${subsidiaryId}` });
                    idx++;
                }
                continue;
            }

            // Manejo de la ruta de espacios deportivos
            if (seg === 'space') {
                if (segments[idx + 1]) {
                    const spaceId = segments[idx + 1];
                    acc += `/${spaceId}`;
                    items.push({ to: acc, label: `Espacio ${spaceId}` });
                    idx++;
                } else {
                    items.push({ to: acc, label: labels.space });
                }
                continue;
            }

            if (segments[idx - 1] === 'companys') {
                if (seg === 'register') {
                    // Caso especial: registro de nueva empresa
                    items.push({ to: acc, label: labels[seg] });
                } else {
                    // Empresa principal individual
                    items.push({ to: acc, label: `Empresa ${seg}` });
                }
                continue;
            }

            items.push({ to: acc, label: labels[seg] || seg });
        }

        return items;
    }, [location.pathname]);

    const menuGroups = [
        {
            title: 'GENERAL',
            items: [
                { to: '/dashboard', label: 'Dashboard', icon: Home },
                { to: '/companys', label: 'Compañias', icon: Building2 },
                { to: '/bookings', label: 'Reservas', icon: TbCalendarCheck },
                { to: '/users', label: 'Usuarios', icon: Users2 },
                { to: '/payment', label: 'Payment', icon: CreditCard },
                { to: '/transaction', label: 'Transaction', icon: ArrowLeftRight },
            ],
        },
        {
            title: 'SUPPORT',
            items: [
                { to: '/reports', label: 'Reportes', icon: FileText },
                { to: '/statistics', label: 'Estadistica', icon: FileText },
                { to: '/earn', label: 'Earn', icon: Gift, badge: '€ 150' },
            ],
        },
    ];

    return (
        <div className='app_admin'>
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className='brand_header'>
                    {!isCollapsed && <div className='brand'>
                        <div className='brand_mark'>
                            <img src={logo} alt="logo" />
                        </div>
                        <span>Admin BS</span>
                    </div>
                    }
                    <TbLayoutSidebarLeftCollapse onClick={toggleSidebar} className="collapse_btn" />
                </div>

                <div className='menu_container'>
                    {menuGroups.map((group) => (
                        <div className='menu_section' key={group.title}>
                            {!isCollapsed && <h6 className='menu_heading'>{group.title}</h6>}
                            <nav className='menu_list'>
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            className={({ isActive }) => `menu_item ${isActive ? 'active' : ''}`}
                                            end={item.to === '/dashboard'}
                                        >
                                            <Icon size={16} strokeWidth={2.3} />
                                            {!isCollapsed && <span>{item.label}</span>}
                                            {!isCollapsed && item.badge && <span className='earn_badge'>{item.badge}</span>}
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                <div className='footer_section'>
                    <button className='menu_item'>
                        <Cog size={16} />
                        {!isCollapsed && <span>Settings</span>}
                    </button>
                    <button className='menu_item'>
                        <HelpCircle size={16} />
                        {!isCollapsed && <span>Help</span>}
                    </button>
                    {!isCollapsed && (
                        <div className='pro_toggle'>
                            <span>Dark Mode</span>
                            <label className='switch'>
                                <input type='checkbox' checked={proMode} onChange={() => setProMode((v) => !v)} />
                                <span className='slider'></span>
                            </label>
                        </div>
                    )}

                    <button className='logout_btn' onClick={handleLogout}>
                        <LogOut size={16} strokeWidth={3} />
                        {!isCollapsed && (
                            <div className='logout_text'>Cerrar Sesión</div>
                        )}
                    </button>
                </div>
            </aside>

            <main className='main'>
                <div className="breadcrumbs">
                    {breadcrumbItems
                        .filter(item => item.label)
                        .map((item, idx, arr) => (
                            <span key={item.to}>
                                <NavLink to={item.to} className="breadcrumb_link">
                                    {item.label}
                                </NavLink>
                                {idx < arr.length - 1 ? <span className="breadcrumb_sep">/</span> : null}
                            </span>
                        ))}
                </div>
                <Outlet />
            </main>
        </div>
    )
}

export default AppAdmin;
