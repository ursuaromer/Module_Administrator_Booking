// Componente para manejar las vistas de Facilities 
import React, { useState } from 'react';

// Importa a las demas vistas
import RegistrationWizard from './RegistrationWizard';
import ListCompany from './ListCompany';
import DetailCompany from './DetailsCompany';

const ViewsCompay = () => {
    // Activar la vista ViewCompany por default
    const [activeViewCompany, setActiveViewCompany] = useState(() => {
        return localStorage.getItem('activeViewCompany') || 'listCompany';
    });

    // Manejar el cambio de vista
    const handleViewChange = (view) => {
        setActiveViewCompany(view);
        // Guardar la vista activa en localStorage
        localStorage.setItem('activeViewCompany', view);
    };

    // Renderiza la vista segun la sección activa
    if (activeViewCompany === 'register') {
        return <RegistrationWizard handleViewChange={handleViewChange} />;
    } else if (activeViewCompany === 'listCompany') {
        return <ListCompany handleViewChange={handleViewChange} />;
    }
    else if (activeViewCompany === 'detail') {
        return <DetailCompany handleViewChange={handleViewChange} />;
    }
    else {
        return <ListCompany handleViewChange={handleViewChange} />;
    }

    
}

export default ViewsCompay;
