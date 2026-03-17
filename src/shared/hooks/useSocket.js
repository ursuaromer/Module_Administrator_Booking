import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

/**
 * Singleton del Socket para el Administrador
 */
const getSocket = () => {
    if (window.__adminBookingSocket && !window.__adminBookingSocket.disconnected) {
        return window.__adminBookingSocket;
    }

    window.__adminBookingSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: false,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000
    });

    return window.__adminBookingSocket;
};

/**
 * Hook para manejar actualizaciones en tiempo real de reservas.
 * Soporta múltiples salas para vista semanal (unión a varios días).
 * 
 * @param {number|string} spaceId - ID del espacio deportivo
 * @param {string|string[]} dates - Fecha única o array de fechas (YYYY-MM-DD)
 */
export const useBookingSocket = (spaceId, dates) => {
    const subscriptionsRef = useRef(new Map());
    const datesArray = Array.isArray(dates) ? dates : [dates];

    useEffect(() => {
        if (!spaceId || !dates || (Array.isArray(dates) && dates.length === 0)) return;

        const socket = getSocket();

        const onConnect = () => {
            console.log('✅ Admin Socket conectado:', socket.id);
            // Unirse a cada sala (una por día)
            datesArray.forEach(date => {
                const room = `space:${spaceId}:${date}`;
                console.log(`📡 Admin uniéndose a sala: ${room}`);
                socket.emit('join_space', { spaceId, date });
            });

            // Re-suscribir listeners
            subscriptionsRef.current.forEach((callback, event) => {
                socket.off(event, callback);
                socket.on(event, callback);
            });
        };

        socket.on('connect', onConnect);

        if (!socket.connected) {
            socket.connect();
        } else {
            datesArray.forEach(date => {
                socket.emit('join_space', { spaceId, date });
            });
        }

        return () => {
            socket.off('connect', onConnect);
            datesArray.forEach(date => {
                socket.emit('leave_space', { spaceId, date });
            });

            subscriptionsRef.current.forEach((callback, event) => {
                socket.off(event, callback);
            });
            subscriptionsRef.current.clear();
            
            // No desconectamos el socket global para permitir otras instancias
        };
    }, [spaceId, JSON.stringify(datesArray)]);

    const subscribe = (event, callback) => {
        const socket = getSocket();
        socket.on(event, callback);
        subscriptionsRef.current.set(event, callback);
    };

    return { subscribe };
};

export default useBookingSocket;
