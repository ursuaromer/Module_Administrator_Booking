import React, { useMemo, useState } from 'react';
import '../styles/appAdmin.css'
import { Home, CreditCard, ArrowLeftRight, FileText, Building2, Users2, Gift, Cog, HelpCircle, LogOut } from 'lucide-react';
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const AppAdmin = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [proMode, setProMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const breadcrumbItems = useMemo(() => {
        const pathname = location.pathname || '';
        const clean = pathname.replace(/\/+$/, '');
        const segments = clean.split('/').filter(Boolean);

        const labels = {
            dashboard: 'Dashboard',
            companys: 'Compañias',
            register: 'Registrar',
            users: 'Usuarios',
            statistics: 'Estadistica',
            reports: 'Reportes',
            payment: 'Payment',
            transaction: 'Transaction',
            earn: 'Earn',
        };

        const items = [];
        let acc = '';
        segments.forEach((seg, idx) => {
            acc += `/${seg}`;

            if (seg === 'dashboard') {
                items.push({ to: '/dashboard', label: labels.dashboard });
                return;
            }

            if (segments[idx - 1] === 'companys' && seg !== 'register') {
                items.push({ to: acc, label: `Empresa ${seg}` });
                return;
            }

            items.push({ to: acc, label: labels[seg] || seg });
        });

        return items;
    }, [location.pathname]);

    const menuGroups = [
        {
            title: 'GENERAL',
            items: [
                { to: '/dashboard', label: 'Dashboard', icon: Home },
                { to: '/dashboard/companys', label: 'Compañias', icon: Building2 },
                { to: '/dashboard/users', label: 'Usuarios', icon: Users2 },
                { to: '/dashboard/payment', label: 'Payment', icon: CreditCard },
                { to: '/dashboard/transaction', label: 'Transaction', icon: ArrowLeftRight },
            ],
        },
        {
            title: 'SUPPORT',
            items: [
                { to: '/dashboard/reports', label: 'Reportes', icon: FileText },
                { to: '/dashboard/statistics', label: 'Estadistica', icon: FileText },
                { to: '/dashboard/earn', label: 'Earn', icon: Gift, badge: '€ 150' },
            ],
        },
    ];

    return (
        <div className='app_admin'>
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className='brand_header'>
                    {!isCollapsed && <div className='brand'>
                        <div className='brand_mark'></div>
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
