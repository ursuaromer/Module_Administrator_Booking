import { useCompanyList } from '../hooks/useCompanyList';
import '../styles/listCompanys.css';
import { Plus, Eye, Edit, MapPin, Users, Building2, CheckCircle2 } from 'lucide-react';
import { LuSearch } from "react-icons/lu";
import { Table, InputField, SelectField } from '../../../shared/components';
import { truncateText } from '../../../shared/utils/formarText';
import { Button } from '../../../shared/components/Buttons';

const ListCompany = () => {
    const {
        loading: isLoadingCompanies,
        error: companiesError,
        searchTerm,
        countryFilter,
        statusFilter,
        countries,
        isLoadingCountries,
        companies,
        totalCompanies,
        activeCompanies,
        inactiveCompanies,
        pagination,
        handleSearchChange,
        handleCountryFilterChange,
        handleStatusFilterChange,
        handleChangeRegister,
        handleView,
        handleEdit,
        getStatusClass,
        getStatusText,
        formatDate,
        handlePageChange,
    } = useCompanyList();

    return (
        <div className="view-company">

            {/* Cabecera de la vista */}
            <section className="company-header">
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
                    <Button
                        text='Nueva Empresa'
                        Icon={Plus}
                        size='md'
                        onClick={handleChangeRegister}
                    />
                </div>
            </section>

            {/* Estadisticas rapidas */}
            <section className="compnays-stats">
                <div className="card">
                    <Building2 size={32} />
                    <div className="stat-info">
                        <h3>{totalCompanies}</h3>
                        <p>Total Empresas</p>
                    </div>
                </div>
                <div className="card">
                    <CheckCircle2 size={32} />
                    <div className="stat-info">
                        <h3>{activeCompanies}</h3>
                        <p>Empresas Activas</p>
                    </div>
                </div>
                <div className="card">
                    <Users size={32} />
                    <div className="stat-info">
                        <h3>{inactiveCompanies}</h3>
                        <p>Empresas Inactivas</p>
                    </div>
                </div>
            </section>

            {/* Seccion de busqueda y filtro */}
            <section className="search_filters">
                <h2>Lista de Empresas</h2>
                <div className="data-filters">
                    <div className="search_box">
                        <InputField
                            label="Buscar empresa deportiva..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            type='text'
                            placeholder=''
                            icon={LuSearch}
                            // iconPosition='left'
                        />
                    </div>
                    <div className="select_box">
                        <SelectField
                            label={'Paises'}
                            value={countryFilter}
                            onChange={handleCountryFilterChange}
                            options={countries.map(country => ({
                                label: country.country,
                                value: country.country_id,
                            }))}
                            showDefaultOption
                            variant
                        />
                    </div>
                    <div className="select_box">
                        <SelectField
                            label={'Estados'}
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            options={[
                                { label: 'Activo', value: 'ACTIVE' },
                                { label: 'Inactivo', value: 'INACTIVE' },
                            ]}
                            showDefaultOption
                            variant
                        />
                    </div>
                </div>
            </section>

            <section>
                <Table
                    data={companies}
                    loading={isLoadingCompanies}
                    emptyText="No se encontraron empresas"
                    keyField="company_id"
                    pagination={{
                        total: pagination.total,
                        page: pagination.page,
                        limit: pagination.limit,
                        totalPages: pagination.totalPages,
                        onPageChange: (p) => handlePageChange(p)
                    }}
                    columns={[
                        {
                            header: "N°",
                            cell: (_, row) => {
                                const currentPage = Number(pagination?.page);
                                const currentLimit = Number(pagination?.limit);
                                const rowIndex = companies.findIndex(company => company.company_id === row.company_id);
                                return <span>{(currentPage - 1) * currentLimit + (rowIndex + 1)}</span>;
                            }
                        },
                        { header: "Código", accessor: "tenant_id" },
                        { header: "Nombre Empresa", accessor: "name" },
                        { header: "Documento", accessor: "document" },
                        {
                            header: "País", accessor: "country",
                            cell: (value, row) => (
                                <>
                                    <img src={value?.flag || ''} alt="" height={10} style={{ marginRight: 4 }} />
                                    <span>{value?.name || 'N/A'}</span>
                                </>
                            )
                        },
                        {
                            header: "Dirección", accessor: "address",
                            cell: (value) => (
                                <span className="cell-with-icon">
                                    <MapPin size={14} />
                                    {truncateText(value, 40)}
                                </span>
                            )
                        },
                        // { header: 'Sucursales', accessor: "aa", cell: (value) => value?.name || "4" },
                        { header: "Fecha Registro", accessor: "created_at", cell: (v) => formatDate(v) },
                        {
                            header: "Estado", accessor: "is_enabled",
                            cell: (v, row) => (
                                <span className={`status ${getStatusClass(v)}`}>
                                    {getStatusText(v)}
                                </span>
                            )
                        },
                        {
                            header: "Acciones",
                            cell: (_, row) => (
                                <div className="action-buttons">
                                    <button className='btn-view' onClick={() => handleView(row.company_id)} title="Ver detalles"><Eye size={16} /></button>
                                    <button className='btn-edit' onClick={() => handleEdit(row.company_id)} title="Editar"><Edit size={16} /></button>
                                </div>
                            )
                        },
                    ]}
                />
            </section>
        </div>
    );
};

export default ListCompany;
