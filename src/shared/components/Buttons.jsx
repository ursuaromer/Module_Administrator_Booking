/**
 * Botón único reutilizable para toda la aplicación.
 *
 * Este componente centraliza el uso de botones y permite
 * definir variantes visuales mediante la prop `variant`.
 * Los estilos se aplican dinámicamente desde Buttons.css.
 * Soporta variantes, tamaños, íconos y estado de carga.
 */

import '../styles/Buttons.css'

/**
 * @component Button
 *
 * @param {Function} onClick - Función que se ejecuta al hacer click en el botón.
 * @param {string} text - Texto que se muestra dentro del botón.
 * @param {string} variant - Variante visual del botón (primary, submit, cancel, back, danger, delete).
 * @param {string} size - Tamaño de boton (sm, md, lg)
 * @param {React.Component} Icon - Componente de ícono opcional que se renderiza antes del texto.
 * @param {'button' | 'submit' | 'reset'} type - Tipo de botón HTML.
 * @param {boolean} disabled - Indica si el botón está deshabilitado.
 * @param {boolean} loading - Indica estado en carga.
 * @param {string} className - Clases CSS adicionales para personalizar el botón.
 */

import '../styles/Buttons.css';

const Button = ({
    onClick,
    text = '',
    variant = 'primary',
    size = 'md',
    Icon,
    type = 'button',
    disabled = false,
    loading = false,
    className = '',
}) => {
    return (
        <button
            type={type}
            className={`
                btn_app
                btn_app_${variant}
                btn_app_${size}
                ${className}
            `.trim()}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {/* Ícono opcional */}
            {Icon && !loading && <Icon className="app-button__icon" />}

            {/* Spinner */}
            {loading && <span className="app-button__loader" />}

            {/* Texto siempre visible */}
            <span className="app-button__text">{text}</span>
        </button>
    );
};

export default Button;
export { Button };
