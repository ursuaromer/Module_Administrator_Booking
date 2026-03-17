import { AlertCircle, ShieldAlert, SearchX, RefreshCw, ArrowLeft } from 'lucide-react';
import '../styles/screenMsg.css';

// LOADING — size='full' (pantalla completa) | 'sm' (inline/compacto)
export const LoadingScreen = ({ message = 'Cargando...', size = 'full' }) => {
    return (
        <div className={`screen_msg load_container${size === 'sm' ? ' screen_msg--sm' : ''}`}>
            <div className={`spinner${size === 'sm' ? ' spinner--sm' : ''}`}></div>
            <p>{message}</p>
        </div>
    );
};

// RECURSO NO ENCONTRADO — onBack opcional
export const NotFoundScreen = ({ message = 'Recurso no encontrado', onBack = null }) => {
    return (
        <div className="screen_msg notfound_container">
            <SearchX size={48} strokeWidth={1.5} />
            <p>{message}</p>
            {onBack && (
                <button className="screen_msg__btn screen_msg__btn--back" onClick={onBack}>
                    <ArrowLeft size={16} /> Volver
                </button>
            )}
        </div>
    );
};

// ERROR
// variant='error'     → error genérico (rojo) — onRetry opcional
// variant='forbidden' → acceso denegado / 403 (naranja) — onBack opcional
export const ErrorScreen = ({
    message = 'Error en la solicitud',
    variant = 'error',
    onRetry = null,
    onBack = null,
}) => {
    const Icon = variant === 'forbidden' ? ShieldAlert : AlertCircle;
    const containerClass = variant === 'forbidden' ? 'forbidden_container' : 'error_container';

    return (
        <div className={`screen_msg ${containerClass}`}>
            <Icon size={48} strokeWidth={1.5} />
            <p>{message}</p>
            {(onBack || onRetry) && (
                <div className="screen_msg__actions">
                    {onBack && (
                        <button className="screen_msg__btn screen_msg__btn--back" onClick={onBack}>
                            <ArrowLeft size={16} /> Volver
                        </button>
                    )}
                    {onRetry && (
                        <button className="screen_msg__btn screen_msg__btn--retry" onClick={onRetry}>
                            <RefreshCw size={16} /> Reintentar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
