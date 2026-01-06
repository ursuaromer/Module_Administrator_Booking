import React, { useState } from 'react';
import '../styles/appAdmin.css'
import { Home, CreditCard, ArrowLeftRight, FileText, Building2, Users2, Lock, Gift, Cog, HelpCircle, LogOut } from 'lucide-react';
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

import ViewDash from '../../modules/dashborad/Views/ViewDash';
import viewsCompany from '../../modules/facilities/views/ViewsCompany';
import ViewUsers from '../../modules/users/views/ViewUsers';
import ViewStatistics from '../../modules/stadistics/views/ViewEstadistic';
import ViewReports from '../../modules/reports/views/ViewReporte';

const AppAdmin = () => {
    const [activeMenu, setActiveMenu] = useState(() => {
        return localStorage.getItem('activeMenu') || 'dashboard';
    });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [proMode, setProMode] = useState(false);
    const navigate = useNavigate();

    const handleClick = (sectionId) => {
        setActiveMenu(sectionId);
        localStorage.setItem('activeMenu', sectionId);
    };

    const handleLogout = () => {
        setActiveMenu('dashboard');
        navigate('/');
    };

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const menuGroups = [
        {
            title: 'GENERAL',
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'companys', label: 'Compañias', icon: Building2 },
                { id: 'users', label: 'Usuarios', icon: Users2 },
                { id: 'payment', label: 'Payment', icon: CreditCard },
                { id: 'transaction', label: 'Transaction', icon: ArrowLeftRight },
            ],
        },
        {
            title: 'SUPPORT',
            items: [
                { id: 'reports', label: 'Reportes', icon: FileText },
                { id: 'statistics', label: 'Estadistica', icon: FileText },
                { id: 'earn', label: 'Earn', icon: Gift, badge: '€ 150' },
            ],
        },
    ];

    const views = {
        dashboard: ViewDash,
        companys: viewsCompany,
        users: ViewUsers,
        statistics: ViewStatistics,
        reports: ViewReports,
    };

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
                                    const isActive = activeMenu === item.id;
                                    return (
                                        <button key={item.id} onClick={() => handleClick(item.id)} className={`menu_item ${isActive ? 'active' : ''}`}>
                                            <Icon size={16} strokeWidth={2.3} />
                                            {!isCollapsed && <span>{item.label}</span>}
                                            {!isCollapsed && item.badge && <span className='earn_badge'>{item.badge}</span>}
                                        </button>
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
                {(() => {
                    const Active = views[activeMenu];
                    if (Active) return <Active />;
                    const current = menuGroups.flatMap(g => g.items).find(i => i.id === activeMenu);
                    return <div className='placeholder'><h2>{current?.label || 'Sección'}</h2><p>Próximamente</p></div>;
                })()}
            </main>
        </div>
    )
}

export default AppAdmin;
