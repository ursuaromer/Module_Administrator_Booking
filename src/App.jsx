import './shared/styles/global.css';
import './shared/styles/colors.css';
import './shared/styles/Buttons.css'
import './shared/styles/animations.css';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './modules/auth/pages/Login';

// Importa toast
import { Toaster } from 'react-hot-toast';

const AppAdmin = lazy(() => import('./shared/pages/AppAdmin'));
const Unauthorized = lazy(() => import('./modules/auth/pages/Unauthorized'));

const ViewDash = lazy(() => import('./modules/dashborad/Views/ViewDash'));
const ListCompany = lazy(() => import('./modules/facilities/views/ListCompany'));
const DetailsCompany = lazy(() => import('./modules/facilities/views/DetailsCompany'));
const RegistrationWizard = lazy(() => import('./modules/facilities/views/RegistrationWizard'));
const RegistrationSubsidiary = lazy(() => import('./modules/facilities/views/RegistrationSubsidiary'));
const ViewUsers = lazy(() => import('./modules/users/views/ViewUsers'));
const ViewStatistics = lazy(() => import('./modules/stadistics/views/ViewEstadistic'));
const ViewReports = lazy(() => import('./modules/reports/views/ViewReporte'));

function App() {

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return Boolean(token) || import.meta.env.DEV;
    };

    const getRole = () => {
        return localStorage.getItem('role') || '';
    };

    const RequireAuth = ({ children }) => {
        if (!isAuthenticated()) return <Navigate to="/" replace />;
        return children;
    };

    const RequireRole = ({ allowedRoles, children }) => {
        if (!allowedRoles?.length) return children;
        const role = getRole();
        if (!role && import.meta.env.DEV) return children;
        if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;
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
            <p>Cargando...</p>
        </div>
    );

    return (
        <Router>
            <Routes>
                {/* Pagina de Login */}
                <Route path='/' element={<Login />} />
                <Route
                    path="/unauthorized"
                    element={
                        <Suspense fallback={suspenseFallback}>
                            <Unauthorized />
                        </Suspense>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth>
                            <Suspense fallback={suspenseFallback}>
                                <AppAdmin />
                            </Suspense>
                        </RequireAuth>
                    }
                >
                    <Route
                        index
                        element={
                            <Suspense fallback={suspenseFallback}>
                                <ViewDash />
                            </Suspense>
                        }
                    />

                    <Route
                        path="companys"
                        element={
                            <RequireRole allowedRoles={['super_admin']}>
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
                                <Suspense fallback={suspenseFallback}>
                                    <RegistrationWizard />
                                </Suspense>
                            }
                        />
                        <Route
                            path=":companyId/register-subsidiary"
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <RegistrationSubsidiary />
                                </Suspense>
                            }
                        />
                        <Route
                            path=":companyId"
                            element={
                                <Suspense fallback={suspenseFallback}>
                                    <DetailsCompany />
                                </Suspense>
                            }
                        />
                    </Route>

                    <Route
                        path="users"
                        element={
                            <Suspense fallback={suspenseFallback}>
                                <ViewUsers />
                            </Suspense>
                        }
                    />
                    <Route
                        path="statistics"
                        element={
                            <Suspense fallback={suspenseFallback}>
                                <ViewStatistics />
                            </Suspense>
                        }
                    />
                    <Route
                        path="reports"
                        element={
                            <Suspense fallback={suspenseFallback}>
                                <ViewReports />
                            </Suspense>
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
