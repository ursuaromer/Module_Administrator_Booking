import React, { useState, useRef, useEffect, useMemo } from 'react';
import '../styles/formComponet.css'
import { LuChevronDown } from 'react-icons/lu';
// Input Field Component
export const InputField = ({
    label = '',           // Texto de la etiqueta del campo
    name = '',            // Nombre único del campo y atributo ID
    type = 'text',   // Tipo de input (text, number, email, password, etc.)
    value,           // Valor actual del campo
    onChange,        // Función que se ejecuta al cambiar el valor
    onBlur,          // Función que se ejecuta al perder el foco
    error,           // Mensaje de error a mostrar
    placeholder = '',     // Texto de sugerencia (visible solo en variant2)
    required = false, // Indica si el campo es obligatorio
    disabled = false, // Desactiva el campo si es true
    icon: Icon,      // Componente de icono a renderizar (opcional)
    variant = 'variant1', // Variante de estilo: 'variant1' (flotante) o 'variant2' (normal)
    iconPosition = 'right', // Posición del icono: 'left' o 'right'
    ...props         // Otras props estándar de HTML input
}) => {
    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    const isVariant2 = variant === 'variant2';

    return (
        <div className={`input_group ${Icon ? `has_icon icon_${iconPosition}` : ''} ${variant}`}>
            {isVariant2 && label && (
                <label htmlFor={name} className="input_label_static">
                    {label}{required && <span className="required">*</span>}
                </label>
            )}
            <div className="input_container">
                {Icon && <Icon className="input_icon" size={15} />}
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={isVariant2 ? placeholder : " "}
                    className={`form_input ${error ? 'error' : ''} ${hasValue ? 'con_texto' : ''}`}
                    required={required}
                    disabled={disabled}
                    {...props}
                />
                {!isVariant2 && (
                    <label htmlFor={name} className="input_label">
                        {label}{required && <span className="required">*</span>}
                    </label>
                )}
            </div>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

// Select Field Component
export const SelectField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    error,
    placeholder = 'Seleccionar...',
    required = false,
    disabled = false,
    icon: Icon,
    variant = false, // false = Nativo, true = Personalizado (Buscable)
    renderOption, // Función opcional para renderizar opciones personalizadas
    width, // Nueva prop para ancho flexible
    showDefaultOption = false, // Nueva prop para mostrar la opción "Todos" con el nombre del label
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Helpers para extraer valores y etiquetas
    const optionValue = (opt) => (typeof opt === 'object' ? opt.value : opt);
    const optionLabel = (opt) => (typeof opt === 'object' ? opt.label : opt);

    // Preparar opciones incluyendo la opción por defecto si es necesario
    const finalOptions = useMemo(() => {
        if (!showDefaultOption) return options;
        const defaultOpt = { value: '', label: 'TODOS' };
        return [defaultOpt, ...options];
    }, [options, showDefaultOption]);

    // Encontrar la opción seleccionada actualmente
    const selectedOption = useMemo(() => 
        finalOptions.find(opt => String(optionValue(opt)).trim() === String(value).trim()), 
    [finalOptions, value]);

    // Filtrar opciones basadas en el término de búsqueda
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return finalOptions;
        return finalOptions.filter(opt => 
            optionLabel(opt).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [finalOptions, searchTerm]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        if (!variant) return;
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [variant]);

    const handleSelect = (option) => {
        const val = optionValue(option);
        onChange?.({
            target: {
                name: name,
                value: val
            }
        });
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    // Estilo para ancho flexible
    const groupStyle = width ? { 
        width: width === 'auto' ? 'fit-content' : width,
        minWidth: width === 'auto' ? '150px' : 'none'
    } : {};

    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    // Si la opción seleccionada tiene el mismo label que el label del componente, no debe flotar
    const isSelectedDefault = selectedOption && selectedOption.label === label;
    const isFloating = (isOpen || searchTerm || hasValue) && !isSelectedDefault;

    if (variant) {
        return (
            <div 
                className={`input_group custom_select_group ${Icon ? 'has_icon' : ''} ${isOpen ? 'is_open' : ''}`} 
                ref={dropdownRef}
                style={groupStyle}
            >
                <div className="input_container">
                    {/* {Icon && <Icon className="input_icon" size={20} />} */}
                    
                    <input
                        type="text"
                        id={name}
                        name={name}
                        value={isOpen ? searchTerm : (selectedOption ? optionLabel(selectedOption) : '')}
                        onChange={handleInputChange}
                        onFocus={() => !disabled && setIsOpen(true)}
                        disabled={disabled}
                        placeholder=" "
                        autoComplete="off"
                        className={`form_input custom_select_trigger ${error ? 'error' : ''} ${isFloating ? 'con_texto' : ''} ${disabled ? 'disabled' : ''}`}
                        {...props}
                    />

                    <label className="input_label" htmlFor={name}>
                        {label}{required && <span className="required">*</span>}
                    </label>

                    <LuChevronDown 
                        className={`dropdown_arrow ${isOpen ? 'rotate' : ''}`} 
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                    />
                </div>

                {isOpen && (
                    <div className="custom_dropdown_menu">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const val = optionValue(option);
                                const lab = optionLabel(option);
                                const isSelected = String(val) === String(value);

                                return (
                                    <div
                                        key={index}
                                        className={`custom_dropdown_item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelect(option)}
                                    >
                                        {renderOption ? renderOption(option) : lab}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="custom_dropdown_no_options">No se encontraron resultados</div>
                        )}
                    </div>
                )}
                {error && <span className="error_message">{error}</span>}
            </div>
        );
    }

    // Renderizado Nativo (Default)
    return (
        <div className={`input_group ${Icon ? `has_icon` : ''}`} style={groupStyle}>
            <div className="input_container">
                {Icon && <Icon className="input_icon" size={20} />}
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`form_select ${error ? 'error' : ''} ${isFloating ? 'con_texto' : ''}`}
                    required={required}
                    disabled={disabled}
                >
                    {!showDefaultOption && <option value="" disabled hidden>{placeholder}</option>}
                    {finalOptions.map((option, index) => {
                        const val = optionValue(option);
                        const lab = optionLabel(option);
                        return (
                            <option key={index} value={val}>
                                {lab}
                            </option>
                        );
                    })}
                </select>
                <label htmlFor={name} className="input_label">
                    {label}{required && <span className="required">*</span>}
                </label>
            </div>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

// TextArea Field Component
export const TextAreaField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    disabled = false,
    rows = 4,
    icon: Icon
}) => {
    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    return (
        <div className={`input_group ${Icon ? 'has_icon' : ''}`}>
            <div className="input_container">
                {Icon && <Icon className="input_icon" size={20} />}
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder=" "
                    className={`form_textarea ${error ? 'error' : ''} ${hasValue ? 'con_texto' : ''}`}
                    required={required}
                    disabled={disabled}
                    rows={rows}
                />
                <label htmlFor={name} className="input_label">
                    {label}{required && <span className="required">*</span>}
                </label>
            </div>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};


// Checkbox Field Component
export const CheckboxField = ({
    label,
    name,
    checked,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false
}) => {
    const handleCheckboxChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className="input_group">
            <label className="checkbox_container">
                <input
                    type="checkbox"
                    id={name}
                    name={name}
                    checked={checked}
                    onChange={handleCheckboxChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={`checkbox-input ${checked ? 'con_texto' : ''}`}
                />
                <span className="checkbox_text">
                    {label}
                    {required && <span className="required">*</span>}
                </span>
            </label>
            {error && <span className="error_message">{error}</span>}
        </div>
    );
};

// Form Section Component
export const FormSection = ({ title, children, className = '', Icon }) => {
    return (
        <div className={`form_section ${className}`}>
            <div className='form_section_title'>
                {Icon && <Icon size={18} />}{title && <h3>{title}</h3>}
            </div>
            <div className="form_section_content">
                {children}
            </div>
        </div>
    );
};

// Form Row Component (for organizing fields in rows)
export const FormRow = ({ children, className = '' }) => {
    return (
        <div className={`form_row ${className}`}>
            {children}
        </div>
    );
};

// Form Actions Component (for button groups)
export const FormActions = ({ children, className = '' }) => {
    return (
        <div className={`form_actions ${className}`}>
            {children}
        </div>
    );
};

