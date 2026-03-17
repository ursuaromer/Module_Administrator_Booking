import axiosInstance from '../../../shared/utils/axiosInstance';

/**
 * Servicio para el manejo de espacios deportivos
 */
class SpaceService {
    /**
     * Registra un nuevo espacio deportivo
     */
    async registerSpace(spaceData) {
        const response = await axiosInstance.post('/spaces/register', spaceData);
        return response.data;
    }

    /**
     * Obtener todos los espacios de una compañía específica
     */
    async getSpacesByCompany(companyId, params = {}) {
        const response = await axiosInstance.get(`/spaces/company/${companyId}`, { params });
        return response.data;
    }

    /**
     * Obtener detalles de un espacio por ID
     */
    async getSpaceDetails(spaceId) {
        const response = await axiosInstance.get(`/spaces/details/${spaceId}`);
        return response.data;
    }

    /**
     * Obtener solo los horarios de un espacio por ID
     */
    async getSpaceSchedules(spaceId) {
        const response = await axiosInstance.get(`/spaces/details/${spaceId}/schedules`);
        return response.data;
    }

    /**
     * Actualizar un espacio existente
     */
    async updateSpace(spaceId, spaceData) {
        const response = await axiosInstance.put(`/spaces/update/${spaceId}`, spaceData);
        return response.data;
    }

    /**
     * Crea o actualiza los horarios de un espacio
     */
    async createSchedules(spaceId, schedulesData) {
        const response = await axiosInstance.post(`/spaces/${spaceId}/schedules`, { schedules: schedulesData });
        return response.data;
    }

    /**
     * Activa o inactiva (cierra/abre) todos los horarios de un día específico
     */
    async toggleDayStatus(spaceId, dayOfWeek, isClosed) {
        const response = await axiosInstance.patch(`/spaces/${spaceId}/schedules/toggle-day`, { 
            day_of_week: dayOfWeek, 
            is_closed: isClosed 
        });
        return response.data;
    }

    /**
     * Sube un archivo multimedia (imagen o video) para un espacio
     */
    async uploadMedia(spaceId, formData) {
        const response = await axiosInstance.post(`/spaces/${spaceId}/media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    /**
     * Elimina un archivo multimedia
     */
    async deleteMedia(mediaId) {
        const response = await axiosInstance.delete(`/spaces/media/${mediaId}`);
        return response.data;
    }

    /**
     * Marca un archivo multimedia como principal
     */
    async setPrimaryMedia(spaceId, mediaId) {
        const response = await axiosInstance.patch(`/spaces/${spaceId}/media/${mediaId}/primary`);
        return response.data;
    }
}

export default new SpaceService();
