import React from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyRegistrationForm from '../components/CompanyRegistrationForm';
import { useCompanyDetails } from '../hooks/useCompanyDetails';
import '../styles/forms.css';

const RegistrationSubsidiary = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const { companyDetails } = useCompanyDetails(companyId);

    const companyIdNumber = Number(companyId);
    const fallbackParentId = Number.isFinite(companyIdNumber) ? companyIdNumber : undefined;

    const parentCompany = {
        id: companyDetails?.id ?? companyDetails?.company_id ?? fallbackParentId,
        name: companyDetails?.name || ''
    };

    const handleCancel = () => {
        if (companyId) {
            navigate(`/dashboard/companys/${companyId}`);
            return;
        }
        navigate('/dashboard/companys');
    };

    const handleSubsidiaryCreated = () => {
        handleCancel();
    };

    return (
        <div className="registration-wizard">
            <div className="wizard-header">
                <button onClick={handleCancel} className="btn btn-secondary">
                    <IoIosArrowRoundBack /> Volver
                </button>
                <h1>Nueva Sucursal</h1>
                <p>Complete el formulario para registrar una sucursal</p>
            </div>

            <CompanyRegistrationForm
                mode="subsidiary"
                parentCompany={parentCompany}
                onSubmit={handleSubsidiaryCreated}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default RegistrationSubsidiary;
