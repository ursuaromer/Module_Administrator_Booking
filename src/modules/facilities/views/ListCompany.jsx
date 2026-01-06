import React from 'react';
import { useCompany } from '../hooks/useCompany';
import '../styles/companys.css';
import { Plus, Eye, Edit, Trash2, MapPin, Clock, Users } from 'lucide-react';
import { LuSearch } from "react-icons/lu";

const ListCompany = () => {
    const {
        loading: isLoadingCompanies,
        error: companiesError,
        searchTerm,
        countryFilter,
        statusFilter,
        uniqueCountries,
        filteredCompanies,
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        handleSearchChange,
        handleCountryFilterChange,
        handleStatusFilterChange,
        handleChangeRegister,
        handleView,
        handleEdit,
        handleDelete,
        getStatusClass,
        getStatusText,
        formatDate
    } = useCompany();    
    
    return (
        <div className="view-company">
            <div className="company-header">
                <div className="header-content">
                    <h1>Gestión de Empresas Deportivas</h1>
                    <p>Administra y controla todas las empresas deportivas registradas</p>
                    {companiesError && (
                        <div className="error-message">
                            Error: {companiesError}
                        </div>
                    )}
                </div>
                <div className="header-actions">
                    <button className="btn-register" onClick={handleChangeRegister}>
                        <Plus size={18} />
                        Nueva Empresa
                    </button>
                </div>
            </div>

            <div className="facilities-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <MapPin size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{totalCompanies}</h3>
                        <p>Total Empresas</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{activeCompanies}</h3>
                        <p>Empresas Activas</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{inactiveCompanies}</h3>
                        <p>Empresas Inactivas</p>
                    </div>
                </div>
            </div>

            <div className="facilities-table-container">
                <div className="table-header">
                    <h2>Lista de Empresas</h2>
                    <div className="table-filters">
                        <div className="search_box">
                            <input
                                className="input_search"
                                type="text"
                                placeholder="Buscar empresa deportiva..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <LuSearch size={16} />
                        </div>
                        <select
                            className="filter-select"
                            value={countryFilter}
                            onChange={handleCountryFilterChange}
                        >
                            <option value="">Todos los países</option>
                            {uniqueCountries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="">Todos los estados</option>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                {isLoadingCompanies ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Cargando empresas...</p>
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="empty-state">
                        <p>No se encontraron empresas que coincidan con los filtros aplicados.</p>
                    </div>
                ) : (
                    <table className="facilities-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre Empresa</th>
                                <th>Documento</th>
                                <th>País</th>
                                <th>Dirección</th>
                                <th>Fecha Registro</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.map((company) => (
                                <tr key={company.id}>
                                    <td>{company.tenant_id}</td>
                                    <td>{company.name}</td>
                                    <td>{company.document}</td>
                                    <td>
                                        <img src={company.country?.flag || ''} alt="" height={8} style={{ marginRight: 3 }} />
                                        <span>{company.country?.name || 'N/A'}</span>
                                    </td>
                                    <td>{company.address}</td>
                                    <td>{formatDate(company.created_at)}</td>
                                    <td>
                                        <span className={`status ${getStatusClass(company.is_enabled)}`}>
                                            {getStatusText(company.is_enabled)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-view"
                                                onClick={() => handleView(company)}
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEdit(company)}
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(company.id)}
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ListCompany;
