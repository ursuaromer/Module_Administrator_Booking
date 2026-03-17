// Componente para crear el modal overlay y cargar un componente hijo dentro
import React from 'react';
import '../styles/Modal.css';
import { LuAppWindow } from "react-icons/lu";

const Modal = ({ isOpen, onClose, title, Icon, children, size = 'medium', headerColor = 'default' }) => {

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose()
        }
    }

    React.useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
            document.body.style.paddingRight = '0px'
        } else {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
            // Forzar el reflow del documento
            document.body.offsetHeight
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
            document.body.style.paddingRight = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            {/* Conteido de modal */}
            <div className={`modal-container modal-${size}`}>
                {/* Header del modal */}
                <header className={`modal-header modal-header-${headerColor}`}>
                    <h2 className="modal-title"> {Icon ? <Icon size={17} /> : <LuAppWindow size={17} />} {title}</h2>
                    <button
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ×
                    </button>
                </header>

                {/* Cuerpo del modal  .modal-body-example*/}
                <main className='modal_body'>
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Modal