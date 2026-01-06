import './shared/styles/global.css';
import './shared/styles/colors.css';
import './shared/styles/Buttons.css'
import './shared/styles/animations.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './modules/auth/pages/Login';
// import Unauthorized from './modules/auth/pages/Unauthorized';
import AppAdmin from './shared/pages/AppAdmin';

// Importa toast
import { Toaster } from 'react-hot-toast';


function App() {

    const isAutenticate = false

    return (
        <Router>
            <Routes>
                {/* Pagina de Login */}
                <Route path='/' element={<Login />} />
                {/* Ruta de acceso no autorizado */}
                {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

                <Route path="/dashboard" element={<AppAdmin />} />
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
