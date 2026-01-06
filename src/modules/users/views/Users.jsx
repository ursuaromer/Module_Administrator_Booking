import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/users.css';
import toast from 'react-hot-toast';

const Users = () => {
    // Mock data para usuarios
    const mockUsers = [
        {
            id: 1,
            nombreCompleto: "Juan Carlos Pérez",
            pais: "Colombia",
            correo: "juan.perez@email.com",
            telefono: "+57 300 123 4567",
            fechaRegistro: "2024-01-15",
            estado: "Activo",
            tipoUsuario: "Cliente",
            ultimaActividad: "2024-01-20"
        },
        {
            id: 2,
            nombreCompleto: "María González López",
            pais: "México",
            correo: "maria.gonzalez@email.com",
            telefono: "+52 55 987 6543",
            fechaRegistro: "2024-01-10",
            estado: "Activo",
            tipoUsuario: "Administrador",
            ultimaActividad: "2024-01-21"
        },
        {
            id: 3,
            nombreCompleto: "Carlos Rodríguez",
            pais: "Argentina",
            correo: "carlos.rodriguez@email.com",
            telefono: "+54 11 456 7890",
            fechaRegistro: "2024-01-08",
            estado: "Inactivo",
            tipoUsuario: "Cliente",
            ultimaActividad: "2024-01-18"
        },
        {
            id: 4,
            nombreCompleto: "Ana Sofía Martínez",
            pais: "Chile",
            correo: "ana.martinez@email.com",
            telefono: "+56 9 234 5678",
            fechaRegistro: "2024-01-12",
            estado: "Activo",
            tipoUsuario: "Moderador",
            ultimaActividad: "2024-01-21"
        },
        {
            id: 5,
            nombreCompleto: "Luis Fernando Torres",
            pais: "Colombia",
            correo: "luis.torres@email.com",
            telefono: "+57 301 876 5432",
            fechaRegistro: "2024-01-05",
            estado: "Suspendido",
            tipoUsuario: "Cliente",
            ultimaActividad: "2024-01-15"
        },
        {
            id: 6,
            nombreCompleto: "Isabella Ramírez",
            pais: "Perú",
            correo: "isabella.ramirez@email.com",
            telefono: "+51 987 654 321",
            fechaRegistro: "2024-01-18",
            estado: "Activo",
            tipoUsuario: "Cliente",
            ultimaActividad: "2024-01-21"
        }
    ];

    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Filtrar usuarios
    const filteredUsers = useMemo(() => {
        return mockUsers.filter(user => {
            const matchesSearch = 
                user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.telefono.includes(searchTerm);
            
            const matchesCountry = !countryFilter || user.pais === countryFilter;
            const matchesStatus = !statusFilter || user.estado === statusFilter;
            const matchesUserType = !userTypeFilter || user.tipoUsuario === userTypeFilter;

            return matchesSearch && matchesCountry && matchesStatus && matchesUserType;
        });
    }, [searchTerm, countryFilter, statusFilter, userTypeFilter]);

    // Paginación
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    // Funciones de manejo
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleCountryFilter = (e) => {
        setCountryFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleUserTypeFilter = (e) => {
        setUserTypeFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleView = (user) => {
        console.log('Ver usuario:', user.nombreCompleto);
    };

    const handleEdit = (user) => {
        console.log('Editar usuario:', user.nombreCompleto);
    };

    const handleDelete = (user) => {
        console.log('Eliminar usuario:', user.nombreCompleto);
    };

    const handleAddUser = () => {
        console.log('Agregar nuevo usuario');
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Activo':
                return 'status-active';
            case 'Inactivo':
                return 'status-inactive';
            case 'Suspendido':
                return 'status-suspended';
            default:
                return '';
        }
    };

    const getUserTypeClass = (type) => {
        switch (type) {
            case 'Administrador':
                return 'type-admin';
            case 'Moderador':
                return 'type-moderator';
            case 'Cliente':
                return 'type-client';
            default:
                return '';
        }
    };

    return (
        <div className="users-view">
            {/* Header */}
            <div className="users-header">
                <div className="header-content">
                    <h1>Gestión de Usuarios</h1>
                    <p>Administra todos los usuarios registrados en el sistema</p>
                </div>
                <button className="add-user-btn" onClick={handleAddUser}>
                    <UserPlus size={20} />
                    Agregar Usuario
                </button>
            </div>

            {/* Estadísticas */}
            <div className="users-stats">
                <div className="stat-card">
                    <h3>{mockUsers.length}</h3>
                    <p>Total Usuarios</p>
                </div>
                <div className="stat-card">
                    <h3>{mockUsers.filter(u => u.estado === 'Activo').length}</h3>
                    <p>Usuarios Activos</p>
                </div>
                <div className="stat-card">
                    <h3>{mockUsers.filter(u => u.tipoUsuario === 'Administrador').length}</h3>
                    <p>Administradores</p>
                </div>
                <div className="stat-card">
                    <h3>{mockUsers.filter(u => u.tipoUsuario === 'Cliente').length}</h3>
                    <p>Clientes</p>
                </div>
            </div>

            {/* Controles de búsqueda y filtros */}
            <div className="users-controls">
                <div className="search-container">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o teléfono..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                
                <div className="filters-container">
                    <select value={countryFilter} onChange={handleCountryFilter} className="filter-select">
                        <option value="">Todos los países</option>
                        <option value="Colombia">Colombia</option>
                        <option value="México">México</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Chile">Chile</option>
                        <option value="Perú">Perú</option>
                    </select>

                    <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
                        <option value="">Todos los estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Suspendido">Suspendido</option>
                    </select>

                    <select value={userTypeFilter} onChange={handleUserTypeFilter} className="filter-select">
                        <option value="">Todos los tipos</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Moderador">Moderador</option>
                        <option value="Cliente">Cliente</option>
                    </select>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="users-table-container">
                <div className="table-header">
                    <h2>Lista de Usuarios</h2>
                    <span className="results-count">
                        Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios
                    </span>
                </div>

                <div className="table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Nombre Completo</th>
                                <th>País</th>
                                <th>Correo Electrónico</th>
                                <th>Teléfono</th>
                                <th>Fecha Registro</th>
                                <th>Estado</th>
                                <th>Tipo Usuario</th>
                                <th>Última Actividad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-name">
                                            <strong>{user.nombreCompleto}</strong>
                                        </div>
                                    </td>
                                    <td>{user.pais}</td>
                                    <td>
                                        <div className="user-email">
                                            {user.correo}
                                        </div>
                                    </td>
                                    <td>{user.telefono}</td>
                                    <td>{new Date(user.fechaRegistro).toLocaleDateString('es-ES')}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(user.estado)}`}>
                                            {user.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`type-badge ${getUserTypeClass(user.tipoUsuario)}`}>
                                            {user.tipoUsuario}
                                        </span>
                                    </td>
                                    <td>{new Date(user.ultimaActividad).toLocaleDateString('es-ES')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="action-btn view-btn" 
                                                onClick={() => handleView(user)}
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                className="action-btn edit-btn" 
                                                onClick={() => handleEdit(user)}
                                                title="Editar usuario"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="action-btn delete-btn" 
                                                onClick={() => handleDelete(user)}
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="pagination">
                    <button 
                        className="pagination-btn" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} />
                        Anterior
                    </button>
                    
                    <div className="pagination-info">
                        <span>Página {currentPage} de {totalPages}</span>
                    </div>
                    
                    <button 
                        className="pagination-btn" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Users;