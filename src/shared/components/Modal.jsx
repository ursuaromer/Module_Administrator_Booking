// Componente para crear el modal overlay y cargar un componente hijo dentro
import React from 'react';
import '../styles/Modal.css';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Modal = ({ isOpen, onClose, title, children, size = 'medium', headerColor = 'default', accion1 = null, accion2 = null, accion3 = null, txt1 = '', txt2 = '' }) => {

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
                <header className={`modal-header ${headerColor !== 'default' ? `modal-header-${headerColor}` : ''}`} style={headerColor !== 'default' && !headerColor.startsWith('#') ? {} : headerColor.startsWith('#') ? { background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%)` } : {}}>
                    <h2 className="modal-title">{title}</h2>
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

                {/* Footer del modal */}
                {(accion1 || accion2 || accion3) && (
                    <aside className="modal_overlay_footer">
                        <div className="btns_left">
                            {accion1 && (
                                <button className='btn_cancel' onClick={accion1}>Cancelar</button>
                            )}
                        </div>
                        <div className="btns_right">
                            {accion2 && (
                                <button className='btn1' onClick={accion2}><IoIosArrowBack /> {txt1 || 'Volver'} </button>
                            )}
                            {accion3 && (
                                <button className='btn2' onClick={accion3}>{txt2 || 'Continuar'} {!txt2 && <IoIosArrowForward />}  </button>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}

export default Modal