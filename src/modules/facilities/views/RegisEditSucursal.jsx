import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyForm from '../components/CompanyForm';
import { useCompanyDetails } from '../hooks/useCompanyDetails';
import { useSucursalDetails } from '../hooks/useSucursalDetails';
import '../styles/forms.css';
import Button from '../../../shared/components/Buttons';
import { CgNotes } from "react-icons/cg";

/**
 * Componente para registrar o editar una sucursal.
 * Si se proporciona un subsidiaryId, el modo es edición.
 * Si se proporciona un companyId, el modo es registro de nueva sucursal para esa empresa.
 */
const RegisEditSucursal = () => {
    const navigate = useNavigate();
    const { companyId, subsidiaryId } = useParams();
    
    // Determinar si es edición o registro
    const isEdit = !!subsidiaryId;

    // Obtener detalles de la sucursal si es edición
    const {
        sucursalDetails,
        error: sError,
    } = useSucursalDetails(isEdit ? subsidiaryId : null);

    // Obtener detalles de la empresa si es registro (para mostrar el nombre del padre)
    // O si es edición, también necesitamos el parent_company_id para mostrar el nombre del padre
    const effectiveCompanyId = isEdit ? sucursalDetails?.parent_company_id : companyId;
    const {
        companyDetails,
        error: cError
    } = useCompanyDetails(effectiveCompanyId);

    const error = isEdit ? sError : cError;

    const handleCancel = () => {
        if (isEdit && subsidiaryId) {
            navigate(`/subsidiary/${subsidiaryId}`);
        } else if (companyId) {
            navigate(`/companys/${companyId}`);
        } else {
            navigate('/companys');
        }
    };

    const handleSuccess = () => {
        handleCancel();
    };

    const parentCompany = {
        id: companyDetails?.id ?? companyDetails?.company_id ?? Number(companyId),
        name: companyDetails?.name || ''
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
                <h1>
                    <CgNotes size={20} /> 
                    {isEdit ? 'Editar Sucursal' : 'Nueva Sucursal'}
                </h1>
                <p>
                    {isEdit 
                        ? 'Actualiza la información de la sucursal' 
                        : `Complete el formulario para registrar una sucursal para ${companyDetails?.name || '---'}`}
                </p>
                {error && <p className="error-message">Error: {error}</p>}
            </div>

            <CompanyForm
                mode="subsidiary"
                initialData={isEdit ? sucursalDetails : null}
                parentCompany={parentCompany}
                onSubmit={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default RegisEditSucursal;
