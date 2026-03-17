import { useState, useCallback, useEffect } from 'react';
import companyService from '../../facilities/services/companyService';
import bookingService from '../services/bookingService';
import { handleAxiosError } from '../../../shared/utils/errorHandler';
import { useAuth } from '../../auth/context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Hook para manejar la lógica de reservas en el módulo admin.
 * Soporta selección jerárquica: Empresa -> Sucursal -> Calendario.
 */
const useBookingReservation = () => {
    const { user } = useAuth();
    // --- Estados de Jerarquía ---
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedSubsidiaryId, setSelectedSubsidiaryId] = useState('');
    const [selectedSubsidiary, setSelectedSubsidiary] = useState(null);
    const [subsidiaries, setSubsidiaries] = useState([]);
    const [loadingSubsidiaries, setLoadingSubsidiaries] = useState(false);
    const [invalidSubsidiary, setInvalidSubsidiary] = useState(false);

    // --- Estados de Calendario ---
    const [mesActual, setMesActual] = useState(new Date());
    const [fechaSeleccionadaCalendario, setFechaSeleccionadaCalendario] = useState(new Date());
    const [vistaReseva, setVistaReserva] = useState(1); // 1 = calendario dinámico, 2 = tabla
    const [tipoVista, setTipoVista] = useState('week');
    const [deporteSeleccionado, setDeporteSeleccionado] = useState(null); 
    const [selectReservation, setSelectReservation] = useState(null);
    const [openMenus, setOpenMenus] = useState({});
    const [semanaSeleccionada, setSemanaSeleccionada] = useState(() => {
        const hoy = new Date();
        const dia = hoy.getDay();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - dia);
        inicioSemana.setHours(0, 0, 0, 0);
        return inicioSemana;
    });

    // --- Estados de Datos de Reservas ---
    const [reservas, setReservas] = useState([]);
    const [loadingReservas, setLoadingReservas] = useState(false);

    // --- Estados para Nueva Reserva ---
    const [showModalNewBooking, setShowModalNewBooking] = useState(false);
    const [initialBookingData, setInitialBookingData] = useState(null);
    const [creatingBooking, setCreatingBooking] = useState(false);

    // --- Lógica de Selección ---
    // ... (sin cambios hasta loadHierarchyData)

    // Carga empresa por ID (escenario MyCompany: system/super_admin seleccionan empresa)
    const loadCompanyData = useCallback(async (companyId) => {
        if (!companyId) {
            setSelectedCompany(null);
            setSubsidiaries([]);
            return;
        }
        setLoadingSubsidiaries(true);
        try {
            const payload = await companyService.getCompanyDetails(companyId);
            const data = payload.data;
            setSelectedCompany(data);
            setSubsidiaries(data.subsidiaries || []);
        } catch (error) {
            toast.error(handleAxiosError(error));
        } finally {
            setLoadingSubsidiaries(false);
        }
    }, []);

    // Carga sucursal por ID (escenario Bookings: URL con subsidiaryId)
    // Usa el endpoint que rechaza en servidor si el ID es de una empresa principal
    const loadHierarchyData = useCallback(async (subsidiaryId) => {
        if (!subsidiaryId) {
            setSelectedCompany(null);
            setSubsidiaries([]);
            return;
        }

        setLoadingSubsidiaries(true);
        setInvalidSubsidiary(false);
        try {
            const payload = await companyService.getSubsidiaryDetails(subsidiaryId);
            const data = payload.data;

            setSelectedCompany(data.parentCompany || data);
            setSubsidiaries(data.parentCompany ? data.parentCompany.subsidiaries : data.subsidiaries || []);
            setSelectedSubsidiaryId(data.company_id);
            setSelectedSubsidiary(data);

            if (data.spaces?.length > 0) {
                setDeporteSeleccionado(data.spaces[0].space_id);
            } else {
                setDeporteSeleccionado(null);
            }
        } catch (error) {
            // El backend devuelve 403 si el ID es de una empresa principal
            if (error?.response?.status === 403) {
                setInvalidSubsidiary(true);
            } else {
                toast.error(handleAxiosError(error));
            }
        } finally {
            setLoadingSubsidiaries(false);
        }
    }, []);

    // Efecto para cargar datos de empresa cuando cambia selectedCompanyId (MyCompany)
    useEffect(() => {
        if (selectedCompanyId) {
            loadCompanyData(selectedCompanyId);
        } else {
            setSelectedCompany(null);
            setSubsidiaries([]);
        }
    }, [selectedCompanyId, loadCompanyData]);

    // Manejar selección de sucursal
    const handleSelectSubsidiary = useCallback((subsidiaryId) => {
        setSelectedSubsidiaryId(subsidiaryId);
        const subsidiary = subsidiaries.find(s => String(s.company_id) === String(subsidiaryId));
        setSelectedSubsidiary(subsidiary);
        
        // Seleccionar el primer espacio por defecto si existe
        if (subsidiary?.spaces?.length > 0) {
            setDeporteSeleccionado(subsidiary.spaces[0].space_id);
        } else {
            setDeporteSeleccionado(null);
        }
    }, [subsidiaries]);

    const obtenerNombreMes = useCallback((fecha) => {
        return fecha.toLocaleDateString('es-ES', { month: 'long' });
    }, []);

    const obtenerNombresDias = useCallback(() => {
        return ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    }, []);

    const obtenerInicioSemana = useCallback((fecha) => {
        const nuevaFecha = new Date(fecha);
        const dia = nuevaFecha.getDay();
        nuevaFecha.setDate(nuevaFecha.getDate() - dia);
        nuevaFecha.setHours(0, 0, 0, 0);
        return nuevaFecha;
    }, []);

    const esDeLaSemanaSeleccionada = useCallback((fecha) => {
        if (!semanaSeleccionada) return false;
        const inicioSemana = obtenerInicioSemana(fecha);
        return inicioSemana.getTime() === semanaSeleccionada.getTime();
    }, [semanaSeleccionada, obtenerInicioSemana]);

    const generarDiasCalendario = useCallback(() => {
        const año = mesActual.getFullYear();
        const mes = mesActual.getMonth();
        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const dias = [];
        const diaInicio = primerDia.getDay();

        // Días del mes anterior
        for (let i = diaInicio - 1; i >= 0; i--) {
            const fecha = new Date(año, mes, -i);
            dias.push({ fecha, numero: fecha.getDate(), esMesAnterior: true, esMesSiguiente: false, esHoy: false, esSeleccionada: false, esDeLaSemanaSeleccionada: esDeLaSemanaSeleccionada(fecha) });
        }

        // Días del mes actual
        for (let d = 1; d <= ultimoDia.getDate(); d++) {
            const fecha = new Date(año, mes, d);
            fecha.setHours(0, 0, 0, 0);
            dias.push({
                fecha,
                numero: d,
                esMesAnterior: false,
                esMesSiguiente: false,
                esHoy: fecha.getTime() === hoy.getTime(),
                esSeleccionada: fechaSeleccionadaCalendario && fecha.getTime() === new Date(fechaSeleccionadaCalendario).setHours(0, 0, 0, 0),
                esDeLaSemanaSeleccionada: esDeLaSemanaSeleccionada(fecha)
            });
        }

        // Días del mes siguiente
        const diasRestantes = 42 - dias.length;
        for (let i = 1; i <= diasRestantes; i++) {
            const fecha = new Date(año, mes + 1, i);
            dias.push({ fecha, numero: i, esMesAnterior: false, esMesSiguiente: true, esHoy: false, esSeleccionada: false, esDeLaSemanaSeleccionada: esDeLaSemanaSeleccionada(fecha) });
        }

        return dias;
    }, [mesActual, fechaSeleccionadaCalendario, esDeLaSemanaSeleccionada]);

    const navegarMes = useCallback((direccion) => {
        setMesActual(prev => {
            const nuevo = new Date(prev);
            nuevo.setMonth(prev.getMonth() + direccion);
            return nuevo;
        });
    }, []);

    const manejarSeleccionFecha = useCallback((fecha) => {
        if (!fecha) return;
        setFechaSeleccionadaCalendario(fecha);
        setSemanaSeleccionada(obtenerInicioSemana(fecha));
    }, [obtenerInicioSemana]);

    const obtenerFechasSemana = useCallback(() => {
        if (!semanaSeleccionada) return [];
        const fechas = [];
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(semanaSeleccionada);
            fecha.setDate(semanaSeleccionada.getDate() + i);
            fechas.push(fecha);
        }
        return fechas;
    }, [semanaSeleccionada]);

    const obtenerFechasMes = useCallback(() => {
        const año = mesActual.getFullYear();
        const mes = mesActual.getMonth();
        const diasEnMes = new Date(año, mes + 1, 0).getDate();
        const fechas = [];
        for (let i = 1; i <= diasEnMes; i++) {
            fechas.push(new Date(año, mes, i));
        }
        return fechas;
    }, [mesActual]);

    const obtenerFechasDinamicas = useCallback(() => {
        switch (tipoVista) {
            case 'day': return [fechaSeleccionadaCalendario];
            case 'week': return obtenerFechasSemana();
            case 'month': return obtenerFechasMes();
            default: return obtenerFechasSemana();
        }
    }, [tipoVista, fechaSeleccionadaCalendario, obtenerFechasSemana, obtenerFechasMes]);

    const handleClickOpenMenu = useCallback((item) => {
        setOpenMenus(prev => ({ ...prev, [item]: !prev[item] }));
    }, []);

    const toggleContent = useCallback((el) => {
        if (el.style.height && el.style.height !== '0px') {
            el.style.height = el.scrollHeight + 'px';
            requestAnimationFrame(() => { el.style.height = '0px'; });
        } else {
            el.style.height = el.scrollHeight + 'px';
            el.addEventListener('transitionend', () => { el.style.height = 'auto'; }, { once: true });
        }
    }, []);

    const handleToggleViewReserva = useCallback(() => {
        setVistaReserva(prev => prev === 1 ? 2 : 1);
    }, []);

    const handleToggleView = useCallback((vista) => setTipoVista(vista), []);
    const handleSelectSport = useCallback((sport) => setDeporteSeleccionado(sport), []);

    // --- Carga de Reservas Reales ---

    const loadReservations = useCallback(async () => {
        if (!deporteSeleccionado) return;

        setLoadingReservas(true);
        try {
            const fechas = obtenerFechasDinamicas();
            const formattedDates = fechas.map(f => {
                const año = f.getFullYear();
                const mes = (f.getMonth() + 1).toString().padStart(2, '0');
                const dia = f.getDate().toString().padStart(2, '0');
                return `${año}-${mes}-${dia}`;
            });
            
            let data;
            if (tipoVista === 'day') {
                const payload = await bookingService.getBookingsBySpace(deporteSeleccionado, formattedDates[0]);
                data = payload.data || [];
            } else {
                // Para semana/mes usamos el rango
                const payload = await bookingService.getBookingsRange(
                    deporteSeleccionado, 
                    formattedDates[0], 
                    formattedDates[formattedDates.length - 1]
                );
                data = payload.data || [];
            }

            // Mapear al formato que espera la tabla dinámica (incluyendo holds y datos de usuario)
            const mappedReservations = data.map(res => {
                const isHold = res.type === 'reserving' || res.booking_id?.toString().startsWith('hold-');
                
                // Extraer información del usuario si existe (para reservas confirmadas/pendientes)
                const userData = res.user ? {
                    nombre: `${res.user.first_name || ''} ${res.user.last_name || ''}`.trim(),
                    email: res.user.email,
                    telefono: res.user.person?.phone || 'Sin teléfono'
                } : null;

                return {
                    id: res.booking_id,
                    cliente: isHold ? 'Reservando...' : (userData?.nombre || res.client_name || 'Cliente Externo'),
                    email: userData?.email || '',
                    telefono: userData?.telefono || '',
                    fecha: res.booking_date.split('T')[0],
                    horaInicio: res.start_time.substring(0, 5),
                    horaFin: res.end_time.substring(0, 5),
                    estado: isHold ? 'hold' : res.status.toLowerCase(), // hold, confirmed, pending, etc.
                    isHold: isHold,
                    raw: res
                };
            });

            setReservas(mappedReservations);
        } catch (error) {
            console.error('Error loading reservations:', error);
            // toast.error('No se pudieron cargar las reservas');
        } finally {
            setLoadingReservas(false);
        }
    }, [deporteSeleccionado, tipoVista, obtenerFechasDinamicas]);

    // Recargar cuando cambie el espacio o la fecha/vista
    useEffect(() => {
        loadReservations();
    }, [loadReservations]);

    const handleClickReserva = useCallback((reserva) => {
        setSelectReservation(prev =>
            !prev || prev.id !== reserva?.id ? reserva : null
        );
    }, []);

    const handleOpenNewBooking = useCallback((fecha, hora) => {
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        const fechaStr = `${año}-${mes}-${dia}`;
        
        setInitialBookingData({ date: fechaStr, time: hora });
        setShowModalNewBooking(true);
    }, []);

    const handleCreateBooking = useCallback(async (formData) => {
        if (!deporteSeleccionado) return;
        
        setCreatingBooking(true);
        try {
            const adminId = user?.user_id;

            const payload = {
                ...formData,
                space_id: deporteSeleccionado,
                sucursal_id: selectedSubsidiary?.sucursal_id,
                is_admin_create: true, // Indica al backend que es creación manual
                admin_id: adminId,      // ID del admin que crea la reserva
                user_create: adminId,   // Auditoría: quién crea el registro
                payment_method_code: 'CASH', // Pago en efectivo presencial
                // Calculamos horaFin basado en duración
                end_time: (() => {
                    const [h, m] = formData.start_time.split(':').map(Number);
                    const totalMin = h * 60 + m + parseInt(formData.duration);
                    const hEnd = Math.floor(totalMin / 60);
                    const mEnd = totalMin % 60;
                    return `${hEnd.toString().padStart(2, '0')}:${mEnd.toString().padStart(2, '0')}:00`;
                })()
            };

            await bookingService.createReservation(payload);
            toast.success('Reserva creada exitosamente');
            setShowModalNewBooking(false);
            loadReservations(); // Recargar tabla
        } catch (error) {
            toast.error(handleAxiosError(error));
        } finally {
            setCreatingBooking(false);
        }
    }, [deporteSeleccionado, loadReservations, user, selectedSubsidiary]);

    return {
        // Jerarquía
        selectedCompanyId,
        setSelectedCompanyId,
        selectedCompany,
        selectedSubsidiaryId,
        selectedSubsidiary,
        handleSelectSubsidiary,
        loadHierarchyData,
        subsidiaries,
        loadingSubsidiaries,
        invalidSubsidiary,

        // Calendario
        mesActual,
        fechaSeleccionadaCalendario,
        semanaSeleccionada,
        vistaReseva,
        tipoVista,
        deporteSeleccionado,
        selectReservation,
        setSelectReservation,
        openMenus,
        generarDiasCalendario,
        navegarMes,
        obtenerNombreMes,
        obtenerNombresDias,
        manejarSeleccionFecha,
        obtenerFechasSemana,
        obtenerFechasDinamicas,
        esDeLaSemanaSeleccionada,
        handleClickOpenMenu,
        toggleContent,
        handleToggleViewReserva,
        handleToggleView,
        handleSelectSport,
        handleClickReserva,

        // Nueva Reserva
        showModalNewBooking,
        setShowModalNewBooking,
        initialBookingData,
        creatingBooking,
        handleOpenNewBooking,
        handleCreateBooking,

        // Reservas Reales
        reservas,
        loadingReservas,
        loadReservations
    };
};

export default useBookingReservation;
