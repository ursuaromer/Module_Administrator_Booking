/**
 * Vista de configuración de la compañía
 * Tabs: Configuración | Métodos de Pago | Mis Admins | Empleados
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import { useAuth } from '../../auth/context/AuthContext';
import ConfigurationForm from '../components/ConfigurationForm';
import PaymentMethodsFlow from '../components/PaymentMethodsFlow';
import CompanyStaffTab from '../components/CompanyStaffTab';
import { LoadingScreen, ErrorScreen } from '../../../shared/components/ScreensMsg';
import Button from '../../../shared/components/Buttons';
import '../styles/configs.css';

const ConfigCompany = () => {
    const { companyId } = useParams();
    const { roles } = useAuth();
    const canManagePayments = roles?.includes('system');
    const canManageAccounts = roles?.includes('system') || roles?.includes('super_admin');
    const {
        config,
        company,
        subsidiaries,
        loading,
        error,
        activeTab,
        tabs,
        saveConfiguration,
        handleBack,
        changeTab,
        tenantStaff,
        loadTenantStaff,
        // PaymentMethodsFlow
        paymentMethods,
        selectedSubId,
        selectedSub,
        connectedMethods,
        isSavingPayments,
        nodes,
        setNodes,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
        onConnect,
        onNodeClick,
        movePaymentItem,
        removePaymentMethod,
        saveActivePayments
    } = useConfiguration(companyId);

    if (loading && !config && activeTab === 'branding') return <LoadingScreen message="Cargando configuración..." />;
    if (error) return <ErrorScreen message={error} />;

    return (
        <div className="config_company_view">
            <header className="config-header">
                <div className="header-left">
                    <Button Icon={ArrowLeft} variant="cancel" onClick={handleBack} />
                    <h1>Configuración de {company?.name}</h1>
                    <span className='empresa'>Empresa</span>
                </div>
            </header>

            <div className="config-tabs-container">
                <div className="tabs-header">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => changeTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <main className="tab_main">
                    {activeTab === 'branding' && (
                        <ConfigurationForm
                            initialData={config}
                            onSave={saveConfiguration}
                            onCancel={handleBack}
                            loading={loading}
                            companyId={companyId}
                        />
                    )}

                    {activeTab === 'payments' && (
                        <PaymentMethodsFlow
                            company={company}
                            subsidiaries={subsidiaries}
                            paymentMethods={paymentMethods}
                            selectedSubId={selectedSubId}
                            selectedSub={selectedSub}
                            connectedMethods={connectedMethods}
                            isSavingPayments={isSavingPayments}
                            nodes={nodes}
                            setNodes={setNodes}
                            onNodesChange={onNodesChange}
                            edges={edges}
                            setEdges={setEdges}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={onNodeClick}
                            movePaymentItem={movePaymentItem}
                            removePaymentMethod={removePaymentMethod}
                            saveActivePayments={saveActivePayments}
                            canManage={canManagePayments}
                            canManageAccounts={canManageAccounts}
                        />
                    )}

                    {activeTab === 'admins' && (
                        <CompanyStaffTab
                            roleType="administrador"
                            staff={tenantStaff}
                            subsidiaries={subsidiaries}
                            onStaffUpdated={loadTenantStaff}
                        />
                    )}

                    {activeTab === 'empleados' && (
                        <CompanyStaffTab
                            roleType="empleado"
                            staff={tenantStaff}
                            subsidiaries={subsidiaries}
                            onStaffUpdated={loadTenantStaff}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default ConfigCompany;
