import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IoIosArrowRoundBack } from "react-icons/io";

// Importa componentes de registro
import CompanyRegistrationForm from '../components/CompanyRegistrationForm';
import SpaceRegistrationForm from '../components/SpaceRegistrationForm';
import '../styles/forms.css';

const RegistrationWizard = ({ onComplete, handleViewChange, initialStep = 1, mockData = {} }) => {
    const [isSubsidiaryOnly, setIsSubsidiaryOnly] = useState(false);
    const [currentStepKey, setCurrentStepKey] = useState(() => {
        if (initialStep === 3) return 'spaces';
        if (initialStep === 2) return 'facility';
        return 'root';
    });
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [registrationData, setRegistrationData] = useState({
        company: null,
        facility: null,
        spaces: []
    });
    const registrationDataRef = useRef(registrationData);

    useEffect(() => {
        registrationDataRef.current = registrationData;
    }, [registrationData]);

    // Mock data for development/testing
    const mockCompanies = mockData.companies || [
        { id: 1, name: 'Deportes XYZ S.A.S' },
        { id: 2, name: 'Club Deportivo Central' }
    ];

    const mockFacilities = mockData.facilities || [
        { id: 1, name: 'Complejo Deportivo Norte', company_id: 1 },
        { id: 2, name: 'Centro Deportivo Sur', company_id: 2 }
    ];

    const mockSurfaceTypes = mockData.surfaceTypes || [
        { id: 1, name: 'Césped Natural' },
        { id: 2, name: 'Césped Sintético' },
        { id: 3, name: 'Concreto' },
        { id: 4, name: 'Parquet' }
    ];

    const steps = useMemo(() => {
        if (isSubsidiaryOnly) {
            return [
                { key: 'root', title: 'Sucursal / Instalación', component: 'root', icon: '🏟️' },
                { key: 'spaces', title: 'Espacios Deportivos', component: 'spaces', icon: '⚽' }
            ];
        }

        return [
            { key: 'root', title: 'Compañia Deportiva', component: 'root', icon: '🏢' },
            { key: 'facility', title: 'Sucursal / Instalación', component: 'facility', icon: '🏟️' },
            { key: 'spaces', title: 'Espacios Deportivos', component: 'spaces', icon: '⚽' }
        ];
    }, [isSubsidiaryOnly]);

    useEffect(() => {
        if (!steps.some(step => step.key === currentStepKey)) {
            setCurrentStepKey(steps[0]?.key ?? 'root');
        }
    }, [currentStepKey, steps]);

    const handleBelongsToCompanyChange = (checked) => {
        setIsSubsidiaryOnly(Boolean(checked));
        setCompletedSteps(new Set());
        setCurrentStepKey('root');
    };

    // Handle step completion
    const handleStepComplete = (stepKey, data) => {
        const previousData = registrationDataRef.current;
        let updatedData = { ...previousData };
        let nextIsSubsidiaryOnly = isSubsidiaryOnly;

        if (stepKey === 'root') {
            nextIsSubsidiaryOnly = Boolean(data?.belongs_to_company);
            if (nextIsSubsidiaryOnly) {
                updatedData = {
                    ...previousData,
                    company: null,
                    facility: data,
                    spaces: previousData.spaces
                };
            } else {
                updatedData = {
                    ...previousData,
                    company: data,
                    facility: null,
                    spaces: previousData.spaces
                };
            }
        }

        if (stepKey === 'facility') {
            updatedData = {
                ...previousData,
                facility: data
            };
        }

        if (stepKey === 'spaces') {
            updatedData = {
                ...previousData,
                spaces: Array.isArray(data) ? data : [...previousData.spaces, data]
            };
        }

        registrationDataRef.current = updatedData;
        setRegistrationData(updatedData);
        setIsSubsidiaryOnly(nextIsSubsidiaryOnly);

        const nextSteps = nextIsSubsidiaryOnly
            ? [
                { key: 'root' },
                { key: 'spaces' }
            ]
            : [
                { key: 'root' },
                { key: 'facility' },
                { key: 'spaces' }
            ];

        const completedKey = stepKey === 'root' ? 'root' : stepKey;
        setCompletedSteps(() => {
            const next = new Set([completedKey]);
            if (completedKey !== 'root') next.add('root');
            if (completedKey === 'spaces') {
                if (nextIsSubsidiaryOnly) {
                    next.add('spaces');
                } else {
                    next.add('facility');
                    next.add('spaces');
                }
            }
            if (completedKey === 'facility') next.add('facility');
            if (completedKey === 'root') next.add('root');
            return next;
        });

        const currentIndex = nextSteps.findIndex(step => step.key === stepKey);
        const nextStep = currentIndex >= 0 ? nextSteps[currentIndex + 1] : null;
        if (nextStep?.key) {
            setCurrentStepKey(nextStep.key);
            return;
        }

        handleComplete(updatedData);
    };

    // Handle wizard completion
    const handleComplete = (finalData = registrationDataRef.current) => {
        if (onComplete) {
            onComplete(finalData);
        }
    };

    // Handle step navigation
    const goToStep = (stepKey) => {
        const stepIndex = steps.findIndex(step => step.key === stepKey);
        if (stepIndex < 0) return;

        const canAccess = steps.slice(0, stepIndex).every(step => completedSteps.has(step.key));
        const isBackwards = steps.findIndex(step => step.key === currentStepKey) >= stepIndex;

        if (isBackwards || canAccess) {
            setCurrentStepKey(stepKey);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (handleViewChange) {
            handleViewChange('listCompany');
        }
    };

    // Render step indicator
    const renderStepIndicator = () => (
        <div className="wizard-steps">
            {steps.map((step, index) => {
                const isActive = currentStepKey === step.key;
                const isCompleted = completedSteps.has(step.key);
                const isAccessible = index <= 0 || steps.slice(0, index).every(s => completedSteps.has(s.key));

                return (
                    <div
                        key={step.key}
                        className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isAccessible ? 'accessible' : ''}`}
                        onClick={() => isAccessible && goToStep(step.key)}
                    >
                        <div className="step-number center">{isCompleted ? '✓' : step.icon}</div>
                        <div className="step-title">{step.title}</div>
                        {index < steps.length - 1 && <div className="step-connector"></div>}
                    </div>
                );
            })}
        </div>
    );

    // Render current step content
    const renderStepContent = () => {
        const currentStepData = steps.find(step => step.key === currentStepKey);

        if (!currentStepData) return null;

        const selectedFacility = registrationData.facility;

        const commonProps = {
            onSubmit: (data) => handleStepComplete(currentStepKey, data),
            onCancel: handleCancel
        };

        switch (currentStepData.component) {
            case 'root':
                return (
                    <CompanyRegistrationForm
                        onSubmit={(data) => handleStepComplete(currentStepKey, data)}
                        onCancel={handleCancel}
                        initialData={isSubsidiaryOnly ? registrationData.facility : registrationData.company}
                        onBelongsToCompanyChange={handleBelongsToCompanyChange}
                    />
                );

            case 'facility':
                return (
                    <CompanyRegistrationForm
                        mode="subsidiary"
                        parentCompany={registrationData.company?.id ? registrationData.company : mockCompanies[0]}
                        onSubmit={(data) => handleStepComplete(currentStepKey, data)}
                        onCancel={handleCancel}
                        initialData={registrationData.facility}
                    />
                );

            case 'spaces':
                return (
                    <SpaceRegistrationForm
                        {...commonProps}
                        initialData={null}
                        facilities={selectedFacility ? [selectedFacility] : mockFacilities}
                        surfaceTypes={mockSurfaceTypes}
                    />
                );

            default:
                return <div>Paso no encontrado</div>;
        }
    };

    return (
        <div className="registration-wizard">

            <div className="wizard-header">
                <button onClick={handleCancel} className="btn btn-secondary">
                    <IoIosArrowRoundBack /> Volver
                </button>
                <h1>Asistente de Registro</h1>
                <p>Complete el registro de su empresa/sucursal y espacios deportivos</p>
            </div>

            {/* Render de indicador de pasos */}
            {renderStepIndicator()}

            {/* Render de formularios */}
            {renderStepContent()}

            {/* Navigation Controls */}
            <div className="wizard-navigation">
                {steps.findIndex(step => step.key === currentStepKey) > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            const currentIndex = steps.findIndex(step => step.key === currentStepKey);
                            const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
                            if (prevStep) setCurrentStepKey(prevStep.key);
                        }}
                        className="btn btn-secondary"
                    >
                        ← Paso Anterior
                    </button>
                )}

                <div className="nav-spacer"></div>

                {(() => {
                    const currentIndex = steps.findIndex(step => step.key === currentStepKey);
                    const nextStep = currentIndex >= 0 ? steps[currentIndex + 1] : null;
                    if (!nextStep) return null;
                    return (
                    <button
                        type="button"
                        onClick={() => setCurrentStepKey(nextStep.key)}
                        className="btn btn-primary"
                        // disabled={!completedSteps.has(currentStepKey)}
                    >
                        Siguiente Paso →
                    </button>
                    );
                })()}

                {currentStepKey === steps[steps.length - 1]?.key && steps.every(step => completedSteps.has(step.key)) && (
                    <button
                        type="button"
                        onClick={handleComplete}
                        className="btn btn-primary"
                    >
                        Finalizar Registro ✓
                    </button>
                )}
            </div>
        </div>
    );
};

export default RegistrationWizard;
