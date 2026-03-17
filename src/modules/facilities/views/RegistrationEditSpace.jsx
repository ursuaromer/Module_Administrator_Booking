/**
 * @description
 * Vista para registrar o editar un espacio deportivo en una sucursal
 * Trae datos de la sucursal y el espacio si se está editando.
 */
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import SpaceForm from '../components/SpaceForm';
import { useSucursalDetails } from '../hooks/useSucursalDetails';
import { useSpace } from '../hooks/useSpace';
import '../styles/forms.css';
import Button from '../../../shared/components/Buttons';
import { CgNotes } from "react-icons/cg";

const RegistrationEditSpace = () => {
    const navigate = useNavigate();
    const { companyId, subsidiaryId, spaceId } = useParams();

    const { sucursalDetails } = useSucursalDetails(subsidiaryId || null);
    const { spaceDetails } = useSpace(spaceId || null);

    const isEdit = !!spaceId;
    const entityName = sucursalDetails?.name
    const sucursalId = sucursalDetails?.sucursal_id || subsidiaryId;
    const companyIdForSpace = sucursalDetails?.company_id;

    const handleCancel = () => {
        if (spaceId) {
            // Si estamos editando, volvemos a los detalles del espacio
            navigate(`/subsidiary/${subsidiaryId}/space/${spaceId}`);
        } else if (subsidiaryId) {
            // Si es un registro nuevo, volvemos a la sucursal
            navigate(`/subsidiary/${subsidiaryId}`);
        } else {
            navigate(`/companys/${companyId}`);
        }
    };

    const handleSpaceSuccess = (result) => {
        if (isEdit) {
            // Después de editar, volvemos a los detalles del espacio
            navigate(`/subsidiary/${subsidiaryId}/space/${spaceId}`);
        } else if (result?.data?.id || result?.data?.space_id) {
            // Si es nuevo y tenemos el ID, podríamos ir a sus detalles (opcional)
            // Por ahora mantenemos la lógica de volver a la sucursal o ir al nuevo
            const newId = result.data.id || result.data.space_id;
            navigate(`/subsidiary/${subsidiaryId}/space/${newId}`);
        } else {
            handleCancel();
        }
    };

    return (
        <div className="registration-wizard">
            <div className="wizard-header">
                <Button 
                    text='Volver'
                    Icon={IoIosArrowRoundBack}
                    onClick={handleCancel}
                    variant='back'
                />
                <h1><CgNotes size={20} />{isEdit ? 'Editar Espacio Deportivo' : 'Nuevo Espacio Deportivo'}</h1>
                <p>
                    {isEdit ? 'Editando' : 'Registrando'} espacio para: <strong>{entityName || 'Cargando...'}</strong>
                </p>
            </div>
            <SpaceForm
                sucursalId={sucursalId}
                companyId={companyIdForSpace}
                initialData={spaceDetails}
                onSubmit={handleSpaceSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default RegistrationEditSpace;
