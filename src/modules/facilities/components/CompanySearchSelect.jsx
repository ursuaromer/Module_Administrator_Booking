import React, { useState, useEffect, useRef } from 'react';
import { LuSearch, LuChevronDown, LuX, LuBuilding2 } from 'react-icons/lu';
import { useCompany } from '../hooks/useCompany';

const CompanySearchSelect = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder = 'Buscar compañía...',
    required = false,
    disabled = false,
    onCompanySelect = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const { companies, loading, loadCompanies, filterCompanies } = useCompany();

    // Cargar compañías al montar
    useEffect(() => {
        if (companies.length === 0) {
            loadCompanies();
        }
    }, [companies.length, loadCompanies]);

    // Obtener compañías filtradas
    const filteredCompanies = searchTerm.length >= 2 ? filterCompanies({ searchTerm }) : [];

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Seleccionar compañía
    const handleCompanySelect = (company) => {
        setSelectedCompany(company);
        setSearchTerm(company.name);
        setIsOpen(false);

        onChange?.({
            target: {
                name: name,
                value: company.id
            }
        });

        onCompanySelect?.(company);
    };

    // Limpiar selección
    const handleClear = () => {
        setSelectedCompany(null);
        setSearchTerm('');

        onChange?.({
            target: {
                name: name,
                value: ''
            }
        });

        onCompanySelect?.(null);
        inputRef.current?.focus();
    };

    // Cambio en búsqueda
    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (!term) {
            setSelectedCompany(null);
            onChange?.({
                target: {
                    name: name,
                    value: ''
                }
            });
        }
    };

    // Renderizar contenido del dropdown
    const renderDropdownContent = () => {
        if (loading) {
            return (
                <div className="dropdown-item loading">
                    <div className="spinner"></div>
                    Cargando compañías...
                </div>
            );
        }

        if (searchTerm.length < 2) {
            return (
                <div className="dropdown-item hint">
                    Escribe al menos 2 caracteres para buscar
                </div>
            );
        }

        if (filteredCompanies.length === 0) {
            return (
                <div className="dropdown-item no-results">
                    <LuBuilding2 size={16} />
                    No se encontraron compañías
                </div>
            );
        }

        return filteredCompanies.map((company) => (
            <div
                key={company.id}
                className={`dropdown-item ${selectedCompany?.id === company.id ? 'selected' : ''}`}
                onClick={() => handleCompanySelect(company)}
            >
                <div className="company-info">
                    <div className="company-name">
                        <LuBuilding2 size={16} />
                        {company.name}
                    </div>
                    <div className="company-details">
                        <span className="document">Doc: {company.document}</span>
                        <span className="address">{company.address}</span>
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="form-field">
            <label htmlFor={name} className="form-label">
                {label}
                {required && <span className="required">*</span>}
            </label>
            
            <div className={`company-search-select ${error ? 'error' : ''}`} ref={dropdownRef}>
                <div className="search-input-container">
                    <div className="search-icon center">
                        <LuSearch size={16} />
                    </div>
                    
                    <input
                        ref={inputRef}
                        type="text"
                        id={name}
                        name={name}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsOpen(true)}
                        onBlur={(e) => setTimeout(() => onBlur?.(e), 150)}
                        placeholder={placeholder}
                        className="search-input"
                        disabled={disabled}
                        autoComplete="off"
                    />
                    
                    {selectedCompany && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="clear-button"
                            disabled={disabled}
                        >
                            <LuX size={16} />
                        </button>
                    )}
                    
                    <div className="dropdown-arrow center">
                        <LuChevronDown size={16} />
                    </div>
                </div>

                {isOpen && (
                    <div className="dropdown-menu">
                        {renderDropdownContent()}
                    </div>
                )}
            </div>
            
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default CompanySearchSelect;