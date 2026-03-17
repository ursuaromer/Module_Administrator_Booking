import { useUsers } from '../hooks/useUsers';
import '../styles/users.css';
import { Eye, Edit, Trash2, User, UserPlus, Mail } from 'lucide-react';
import { LuSearch } from "react-icons/lu";
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Buttons';

const Users = () => {
    const {
        loading,
        error,
        searchTerm,
        roleFilter,
        countryFilter,
        statusFilter,
        filteredUsers,
        stats,
        pagination,
        roles,
        countries,
        handleSearchChange,
        handleRoleFilterChange,
        handleCountryFilterChange,
        handleStatusFilterChange,
        handleAddUser,
        handleView,
        handleEdit,
        handleDelete,
        getUserTypeClass,
        formatDate,
        handlePageChange,
    } = useUsers();

    console.log(filteredUsers);
    

    return (
        <div className="view-user">
            {/* Encabezado de la vista */}
            <section className="users-header">
                <div className="header-content">
                    <h1>Gestión de Usuarios</h1>
                    <p>Administra todos los usuarios registrados en el sistema</p>
                    {error && (
                        <div className="error-message">
                            Error: {error}
                        </div>
                    )}
                </div>
                <div className="header-actions">
                    <Button
                        text='Nuevo usuario'
                        Icon={UserPlus}
                        onClick={handleAddUser}
                    />
                </div>
            </section>

            {/* Estadísticas rapidas */}
            <section className="users-stats">
                <div className="card">
                    <User size={32} />
                    <div className="stat-info">
                        <h3>{stats?.totalUsers || 0}</h3>
                        <p>Total Usuarios</p>
                    </div>
                </div>
                <div className="card">
                    <User size={32} />
                    <div className="stat-info">
                        <h3>{stats?.byRole?.administrador || 0}</h3>
                        <p>Administradores</p>
                    </div>
                </div>
                <div className="card">
                    <User size={32} />
                    <div className="stat-info">
                        <h3>{stats?.byRole?.cliente || 0}</h3>
                        <p>Clientes</p>
                    </div>
                </div>
            </section>

            {/* Controles de búsqueda y filtros */}
            <section className="search_filters">
                <h2>Lista de Usuarios</h2>
                <div className="data-filters">
                    <div className="search_box">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo o teléfono..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="input_search"
                        />
                        <LuSearch size={16} />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={handleRoleFilterChange}
                        className="filter-select"
                    >
                        <option value="">Todos los roles</option>
                        {roles.map((role) => {
                            return (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            );
                        })}
                    </select>

                    <select
                        value={countryFilter}
                        onChange={handleCountryFilterChange}
                        className="filter-select"
                    >
                        <option value="">Todos los países</option>
                        {countries.map(country => (
                            <option key={country.value} value={country.value}>
                                {country.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="filter-select"
                    >
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                    </select>
                </div>
            </section>

            {/* Tabla de usuarios */}
            <section>
                <Table
                    data={filteredUsers}
                    loading={loading}
                    emptyText="No se encontraron usuarios"
                    keyField="user_id"
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
                                const rowIndex = filteredUsers.findIndex(user => user.user_id === row.user_id);
                                return <span>{(currentPage - 1) * currentLimit + (rowIndex + 1)}</span>;
                            }
                        },
                        {
                            header: "Nombre Completo", accessor: "first_name",
                            cell: (_, row) => (
                                <span>{`${row.name} ${row.lastName}`}</span>
                            )
                        },
                        {
                            header: "Correo Electrónico", accessor: "email",
                            cell: (value) => (
                                <span className="cell-with-icon">
                                    <Mail size={14} />
                                    {value}
                                </span>
                            )
                        },
                        { header: "Teléfono", accessor: "phone", cell: (value) => value || "-" },
                        {
                            header: "Rol", accessor: "role_name",
                            cell: (value) => (
                                <div
                                    className={`type_role ${getUserTypeClass(value)}`}
                                >
                                    {value || '---'}
                                </div>
                            )
                        },
                        { header: "Fecha Registro", accessor: "created_at", cell: (value) => formatDate(value) },
                        {
                            header: "Acciones",
                            cell: (_, row) => (
                                <div className="action-buttons">
                                    <button className='btn-view' onClick={() => handleView(row)} title="Ver detalles"><Eye size={16} /></button>
                                    <button className='btn-edit' onClick={() => handleEdit(row)} title="Editar"><Edit size={16} /></button>
                                    <button className='btn-delete' onClick={() => handleDelete(row)} title="Eliminar"><Trash2 size={16} /></button>
                                </div>
                            )
                        }
                    ]}
                />
            </section>
        </div>
    );
};

export default Users;