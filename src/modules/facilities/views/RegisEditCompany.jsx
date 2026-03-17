import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyForm from '../components/CompanyForm';
import { useCompanyDetails } from '../hooks/useCompanyDetails';
import '../styles/forms.css';
import Button from '../../../shared/components/Buttons';
import { CgNotes } from "react-icons/cg";

/**
 * Componente para registrar o editar una empresa deportiva.
 * Si se proporciona un companyId en los parámetros, el modo es edición.
 * De lo contrario, el modo es registro.
 */
const RegisEditCompany = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    
    // Si hay companyId, estamos en modo edición
    const isEdit = !!companyId;

    const {
        companyDetails,
        error,
        loading
    } = useCompanyDetails(isEdit ? companyId : null);

    const handleCancel = () => {
        if (isEdit && companyId) {
            navigate(`/companys/${companyId}`);
        } else {
            navigate('/companys');
        }
    };

    const handleSuccess = (data) => {
        if (isEdit) {
            handleCancel();
        } else {
            const createdId = data?.id ?? data?.company_id;
            if (createdId) {
                navigate(`/companys/${createdId}`);
            } else {
                navigate('/companys');
            }
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
                <h1>
                    <CgNotes size={20} /> 
                    {isEdit ? 'Editar Empresa' : 'Registrar Empresa'}
                </h1>
                <p>
                    {isEdit 
                        ? 'Actualiza la información de la empresa deportiva' 
                        : 'Complete el formulario para registrar una nueva empresa deportiva'}
                </p>
                {error && <p className="error-message">Error: {error}</p>}
            </div>

            <CompanyForm
                mode="parent"
                initialData={isEdit ? companyDetails : null}
                onSubmit={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default RegisEditCompany;
