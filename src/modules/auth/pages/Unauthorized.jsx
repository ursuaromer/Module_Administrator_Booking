import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-secondary-800 mb-4">
                    Acceso No Autorizado
                </h1>

                <p className="text-secondary-600 mb-8">
                    No tienes permisos para acceder a esta página.
                    Contacta al administrador si crees que esto es un error.
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="btn-primary inline-flex items-center"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;