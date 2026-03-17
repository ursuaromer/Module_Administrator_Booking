import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LuX } from 'react-icons/lu';
import '../styles/searchSelect.css';

/**
 * SearchSelect Component - A generic searchable dropdown
 * Supports both local filtering and remote (backend) searching.
 */
const SearchSelect = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder = 'Buscar...',
    required = false,
    disabled = false,
    options = [], // Local options: [{ value, label, ... }]
    onSearch,     // Async function for backend search: (term) => Promise<options>
    loading = false,
    renderOption, // Optional: (option) => ReactNode
    icon: Icon,
    iconPosition = 'left',
    variant = false, // true = Floating label, false = Standard label (default)
    minChars = 2,
    clearable = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [remoteOptions, setRemoteOptions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const hasValue = value !== undefined && value !== null && String(value).trim() !== '';
    
    // Combine local options with remote results
    const allOptions = onSearch ? remoteOptions : options;
    
    // Find selected option label
    const selectedOption = (onSearch ? [...remoteOptions, ...options] : options).find(
        opt => String(opt.value) === String(value)
    );

    // Initial sync of searchTerm if value exists but searchTerm is empty
    useEffect(() => {
        if (selectedOption && !searchTerm && !isOpen) {
            setSearchTerm(selectedOption.label);
        }
    }, [selectedOption, isOpen]);

    // Local filtering if no onSearch is provided
    const filteredOptions = !onSearch && searchTerm.length >= minChars
        ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    // Handle remote search with debounce
    const handleRemoteSearch = useCallback(async (term) => {
        if (!onSearch || term.length < minChars) {
            setRemoteOptions([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await onSearch(term);
            setRemoteOptions(results || []);
        } catch (err) {
            console.error("SearchSelect Error:", err);
            setRemoteOptions([]);
        } finally {
            setIsSearching(false);
        }
    }, [onSearch, minChars]);

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setIsOpen(true);

        if (onSearch) {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => handleRemoteSearch(term), 400);
        }

        if (!term && clearable) {
            onChange?.({ target: { name, value: '' } });
        }
    };

    const handleSelect = (option) => {
        setSearchTerm(option.label);
        setIsOpen(false);
        onChange?.({ target: { name, value: option.value } });
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setSearchTerm('');
        setRemoteOptions([]);
        onChange?.({ target: { name, value: '' } });
        inputRef.current?.focus();
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                // Reset search term to selected label if closed without selecting
                if (selectedOption) {
                    setSearchTerm(selectedOption.label);
                } else if (!value) {
                    setSearchTerm('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOption, value]);

    const containerClass = [
        'search_select_container',
        variant ? 'variant_floating' : 'variant_standard',
        Icon ? `has_icon icon_${iconPosition}` : '',
        error ? 'has_error' : '',
        disabled ? 'is_disabled' : '',
        isOpen ? 'is_open' : ''
    ].join(' ');

    return (
        <div className={containerClass} ref={dropdownRef}>
            {!variant && label && (
                <label htmlFor={name} className="label_standard">
                    {label}{required && <span className="required">*</span>}
                </label>
            )}

            <div className="search_input_wrapper">
                {Icon && <Icon className="field_icon" size={18} />}
                
                <input
                    ref={inputRef}
                    type="text"
                    id={name}
                    name={name}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onBlur={(e) => setTimeout(() => onBlur?.(e), 200)}
                    placeholder={variant ? " " : placeholder}
                    className="search_input_field"
                    disabled={disabled}
                    autoComplete="off"
                />

                {variant && label && (
                    <label htmlFor={name} className="label_floating">
                        {label}{required && <span className="required">*</span>}
                    </label>
                )}

                <div className="action_icons">
                    {hasValue && clearable && !disabled && (
                        <LuX className="clear_icon" onClick={handleClear} />
                    )}
                    {/* <LuChevronDown className="arrow_icon" onClick={() => !disabled && setIsOpen(!isOpen)} /> */}
                </div>
            </div>

            {isOpen && (
                <div className="search_dropdown_menu">
                    {(loading || isSearching) ? (
                        <div className="dropdown_message loading">
                            <div className="search_spinner"></div>
                            Buscando...
                        </div>
                    ) : searchTerm.length < minChars && onSearch ? (
                        <div className="dropdown_message hint">
                            Escribe al menos {minChars} caracteres
                        </div>
                    ) : (onSearch ? remoteOptions : filteredOptions).length === 0 ? (
                        <div className="dropdown_message no_results">
                            No se encontraron resultados
                        </div>
                    ) : (
                        <div className="options_list">
                            {(onSearch ? remoteOptions : filteredOptions).map((opt, i) => (
                                <div
                                    key={i}
                                    className={`option_item ${String(opt.value) === String(value) ? 'selected' : ''}`}
                                    onClick={() => handleSelect(opt)}
                                >
                                    {renderOption ? renderOption(opt) : (
                                        <div className="default_option_render">
                                            <span className="option_label">{opt.label}</span>
                                            {opt.subLabel && <span className="option_sublabel">{opt.subLabel}</span>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {error && <span className="error_text">{error}</span>}
        </div>
    );
};

export default SearchSelect;
