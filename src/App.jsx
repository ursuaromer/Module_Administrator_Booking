import './shared/styles/global.css';
import './shared/styles/colors.css';
import './shared/styles/Buttons.css'
import './shared/styles/animations.css';

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './modules/auth/pages/Login';
import { useAuth } from './modules/auth/context/AuthContext.jsx';

import { Toaster } from 'react-hot-toast';

const AppAdmin = lazy(() => import('./shared/pages/AppAdmin'));
const Unauthorized = lazy(() => import('./modules/auth/pages/Unauthorized'));
const ViewDash = lazy(() => import('./modules/dashborad/Views/ViewDash'));
const ListCompany = lazy(() => import('./modules/facilities/views/ListCompany'));
const Company = lazy(() => import('./modules/facilities/views/Company'));
const ConfigCompany = lazy(() => import('./modules/facilities/views/ConfigCompany'))
const Subsidiary = lazy(() => import('./modules/facilities/views/Subsidiary.jsx'));
const Space = lazy(() => import('./modules/facilities/views/Space'));
const RegistrationEditSpace = lazy(() => import('./modules/facilities/views/RegistrationEditSpace'));
const RegisEditCompany = lazy(() => import('./modules/facilities/views/RegisEditCompany.jsx'));
const RegisEditSucursal = lazy(() => import('./modules/facilities/views/RegisEditSucursal.jsx'));
const UsersList = lazy(() => import('./modules/users/views/UsersList'));
const ViewStatistics = lazy(() => import('./modules/stadistics/views/ViewEstadistic'));
const ViewReports = lazy(() => import('./modules/reports/views/ViewReporte'));
const MyCompany = lazy(() => import('./modules/bookings/views/MyCompany'));
const Bookings = lazy(() => import('./modules/bookings/views/Bookings.jsx'));

// Todos los roles que pueden usar el módulo administrador
const ADMIN_ROLES = ['system', 'super_admin', 'administrador', 'empleado'];

function App() {

    const { isAuthenticated, roles } = useAuth();

    const hasRole = (allowedRoles) => roles.some(r => allowedRoles.includes(r));

    const RequireAuth = ({ children }) => {
        if (!isAuthenticated) return <Navigate to="/" replace />;
        return children;
    };

    const RequireRole = ({ allowedRoles, children }) => {
        if (!allowedRoles?.length) return children;
        if (!hasRole(allowedRoles)) return <Navigate to="/unauthorized" replace />;
        return children;
    };

    const Placeholder = ({ title }) => (
        <div className="placeholder">
            <h2>{title}</h2>
            <p>Próximamente</p>
        </div>
    );

    const suspenseFallback = (
        <div className="placeholder">
            <p>Cargando app...</p>
        </div>
    );

    return (
        <Router>
            <Routes>
                {/* Redirigir / a /login */}
                <Route path='/' element={<Navigate to="/login" replace />} />
                {/* Pagina de Login */}
                <Route path='/login' element={<Login />} />
                <Route
                    path="/unauthorized"
                    element={
                        <Suspense fallback={suspenseFallback}>
                            <Unauthorized />
                        </Suspense>
                    }
                />

                {/* Layout AppAdmin — accesible por todos los roles admin */}
                <Route
                    element={
                        <RequireAuth>
                            <RequireRole allowedRoles={ADMIN_ROLES}>
                                <Suspense fallback={suspenseFallback}>
                                    <AppAdmin />
                                </Suspense>
                            </RequireRole>
                        </RequireAuth>
                    }
                >
                    {/* Solo system ve el dashboard global */}
                    <Route
                        path="/dashboard"
                        element={
                            <RequireRole allowedRoles={['system']}>
                                <Suspense fallback={suspenseFallback}>
                                    <ViewDash />
                                </Suspense>
                            </RequireRole>
                        }
                    />

                    {/* Rutas para empresas — system y super_admin */}
                    <Route
                        path="companys"
                        element={
                            <RequireRole allowedRoles={['system', 'super_admin']}>
                                <Suspense fallback={suspenseFallback}>
                                    <Outlet />
                                </Suspense>
                            </RequireRole>
                        }
                    >
                        <Route
                            index
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <ListCompany />
                                </Suspense>
                            }
                        />
                        <Route
                            path="register"
                            element={
                                <RequireRole allowedRoles={['system']}>
                                    <Suspense fallback={suspenseFallback}>
                                        <RegisEditCompany />
                                    </Suspense>
                                </RequireRole>
                            }
                        />
                        <Route
                            path=":companyId/register-subsidiary"
                            element={
                                <RequireRole allowedRoles={['system']}>
                                    <Suspense fallback={suspenseFallback}>
                                        <RegisEditSucursal />
                                    </Suspense>
                                </RequireRole>
                            }
                        />
                        <Route
                            path=':companyId/edit'
                            element={
                                <RequireRole allowedRoles={['system', 'super_admin']}>
                                    <Suspense fallback={suspenseFallback}>
                                        <RegisEditCompany />
                                    </Suspense>
                                </RequireRole>
                            }
                        />
                        <Route
                            path=":companyId"
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <Company />
                                </Suspense>
                            }
                        />
                        <Route
                            path=':companyId/config'
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <ConfigCompany />
                                </Suspense>
                            }
                        />
                    </Route>

                    {/* Rutas para Sucursales — todos los roles admin */}
                    <Route
                        path="subsidiary"
                        element={
                            <Suspense fallback={suspenseFallback}>
                                <Outlet />
                            </Suspense>
                        }
                    >
                        <Route
                            path=":subsidiaryId"
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <Subsidiary />
                                </Suspense>
                            }
                        />
                        <Route
                            path=":subsidiaryId/edit"
                            element={
                                <RequireRole allowedRoles={['system', 'super_admin', 'administrador']}>
                                    <Suspense fallback={suspenseFallback}>
                                        <RegisEditSucursal />
                                    </Suspense>
                                </RequireRole>
                            }
                        />
                        <Route
                            path=":subsidiaryId/register-space"
                            element={
                                <RequireRole allowedRoles={['system', 'super_admin', 'administrador']}>
                                    <Suspense fallback={suspenseFallback}>
                                        <RegistrationEditSpace />
                                    </Suspense>
                                </RequireRole>
                            }
                        />
                        <Route
                            path=":subsidiaryId/space/:spaceId"
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <Space />
                                </Suspense>
                            }
                        />
                        <Route
                            path=":subsidiaryId/space/:spaceId/edit"
                            element={
                                <RequireRole allowedRoles={['system', 'super_admin', 'administrador']}>
                                    <Suspense fallback={suspenseFallback}>
                                        <RegistrationEditSpace />
                                    </Suspense>
                                </RequireRole>
                            }
                        />
                    </Route>

                    {/* Usuarios — solo system */}
                    <Route
                        path="users"
                        element={
                            <RequireRole allowedRoles={['system']}>
                                <Suspense fallback={suspenseFallback}>
                                    <UsersList />
                                </Suspense>
                            </RequireRole>
                        }
                    />

                    {/* Reservas — todos los roles admin */}
                    <Route
                        path="bookings"
                        element={
                            <Suspense fallback={suspenseFallback}>
                                <Outlet />
                            </Suspense>
                        }
                    >
                        <Route
                            index
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <MyCompany />
                                </Suspense>
                            }
                        />
                        <Route
                            path=":subsidiaryId"
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <Bookings />
                                </Suspense>
                            }
                        />
                    </Route>

                    {/* Estadísticas y reportes — system y super_admin */}
                    <Route
                        path="statistics"
                        element={
                            <RequireRole allowedRoles={['system', 'super_admin']}>
                                <Suspense fallback={suspenseFallback}>
                                    <ViewStatistics />
                                </Suspense>
                            </RequireRole>
                        }
                    />
                    <Route
                        path="reports"
                        element={
                            <RequireRole allowedRoles={['system', 'super_admin']}>
                                <Suspense fallback={suspenseFallback}>
                                    <ViewReports />
                                </Suspense>
                            </RequireRole>
                        }
                    />

                    <Route path="payment" element={<Placeholder title="Payment" />} />
                    <Route path="transaction" element={<Placeholder title="Transaction" />} />
                    <Route path="earn" element={<Placeholder title="Earn" />} />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {/* Configuración global de notificaciones */}
            <Toaster
                position="top-right"
                reverseOrder={true}
                toastOptions={{
                    duration: 2000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        theme: {
                            primary: '#4ade80',
                            secondary: '#black',
                        },
                    },
                    error: {
                        duration: 5000,
                        theme: {
                            primary: '#ef4444',
                            secondary: '#black',
                        },
                    },
                }}
            />
        </Router>
    )
}

export default App
