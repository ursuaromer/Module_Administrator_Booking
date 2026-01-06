import React from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import CompanyRegistrationForm from '../components/CompanyRegistrationForm';
import '../styles/forms.css';

const RegistrationWizard = () => {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/dashboard/companys');
    };

    const handleCompanyCreated = (company) => {
        const createdId = company?.id ?? company?.company_id;
        if (createdId) {
            navigate(`/dashboard/companys/${createdId}`);
            return;
        }
        navigate('/dashboard/companys');
    };

    return (
        <div className="registration-wizard">
            <div className="wizard-header">
                <button onClick={handleCancel} className="btn btn-secondary">
                    <IoIosArrowRoundBack /> Volver
                </button>
                <h1>Registrar Empresa</h1>
                <p>Complete el formulario para registrar una nueva empresa deportiva</p>
            </div>

            <CompanyRegistrationForm
                mode="parent"
                onSubmit={handleCompanyCreated}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default RegistrationWizard;
