import React from 'react';

// Input Field Component
export const InputField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    disabled = false,
    min,
    max,
    step
}) => {
    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    return (
        <div className="form-field">
            <label htmlFor={name} className="form-label">
                {label}
                {required && <span className="required">*</span>}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`form-input ${error ? 'error' : ''} ${hasValue ? 'con-texto' : ''}`}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
            />
            {error && <span className="error-message">{error}</span>}
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
    options,
    error,
    placeholder = 'Seleccionar...',
    required = false,
    disabled = false
}) => {
    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    return (
        <div className="form-field">
            <label htmlFor={name} className="form-label">
                {label}
                {required && <span className="required">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                className={`form-select ${error ? 'error' : ''} ${hasValue ? 'con-texto' : ''}`}
                required={required}
                disabled={disabled}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="error-message">{error}</span>}
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
    rows = 4
}) => {
    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    return (
        <div className="form-field">
            <label htmlFor={name} className="form-label">
                {label}
                {required && <span className="required">*</span>}
            </label>
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`form-textarea ${error ? 'error' : ''} ${hasValue ? 'con-texto' : ''}`}
                required={required}
                disabled={disabled}
                rows={rows}
            />
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

// Number Field Component
export const NumberField = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    required = false,
    disabled = false,
    min,
    max,
    step = 'any'
}) => {
    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    return (
        <div className="form-field">
            <label htmlFor={name} className="form-label">
                {label}
                {required && <span className="required">*</span>}
            </label>
            <input
                type="number"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`form-input ${error ? 'error' : ''} ${hasValue ? 'con-texto' : ''}`}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
            />
            {error && <span className="error-message">{error}</span>}
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
        <div className="form-field">
            <div className="checkbox-group">
                <label className="form-label">
                    <input
                        type="checkbox"
                        id={name}
                        name={name}
                        checked={checked}
                        onChange={handleCheckboxChange}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={`checkbox-input ${checked ? 'con-texto' : ''}`}
                    />
                    <span className="checkbox-text">
                        {label}
                        {required && <span className="required">*</span>}
                    </span>
                </label>
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

// Form Section Component
export const FormSection = ({ title, children, className = '' }) => {
    return (
        <div className={`form-section ${className}`}>
            {title && <h3 className="form-section-title">{title}</h3>}
            <div className="form-section-content">
                {children}
            </div>
        </div>
    );
};

// Form Row Component (for organizing fields in rows)
export const FormRow = ({ children, className = '' }) => {
    return (
        <div className={`form-row ${className}`}>
            {children}
        </div>
    );
};

// Submit Button Component
export const SubmitButton = ({
    children,
    isLoading = false,
    disabled = false,
    onClick,
    type = 'submit',
    variant = 'primary'
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`btn btn-${variant} ${isLoading ? 'loading' : ''}`}
        >
            {isLoading ? (
                <>
                    <span className="spinner"></span>
                    Procesando...
                </>
            ) : (
                children
            )}
        </button>
    );
};

// Cancel Button Component
export const CancelButton = ({ children, onClick, disabled = false }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="btn btn-secondary"
        >
            {children}
        </button>
    );
};

// Form Actions Component (for button groups)
export const FormActions = ({ children, className = '' }) => {
    return (
        <div className={`form-actions ${className}`}>
            {children}
        </div>
    );
};

// Error Summary Component
export const ErrorSummary = ({ errors }) => {
    const errorList = Object.values(errors).filter(error => error);

    if (errorList.length === 0) return null;

    return (
        <div className="error-summary">
            <h4>Por favor, corrija los siguientes errores:</h4>
            <ul>
                {errorList.map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
        </div>
    );
};
